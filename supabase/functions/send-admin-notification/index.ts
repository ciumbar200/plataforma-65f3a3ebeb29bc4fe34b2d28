import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

type NotificationType = "new_tenant" | "new_property";

interface TenantPayload {
  type: "new_tenant";
  tenant: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    locality?: string | null;
    rental_goal?: string | null;
    budget?: number | null;
    lifestyle?: string[] | null;
    bio?: string | null;
    role?: string | null;
  };
  meta?: {
    profile_url?: string | null;
  };
}

interface PropertyPayload {
  type: "new_property";
  property: {
    id: number;
    title?: string | null;
    address?: string | null;
    city?: string | null;
    locality?: string | null;
    property_type?: string | null;
    price?: number | null;
    visibility?: string | null;
    available_from?: string | null;
    status?: string | null;
    url?: string | null;
  };
  owner: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

type AdminNotificationPayload = TenantPayload | PropertyPayload;

const requireEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const compact = (value?: string | null) =>
  typeof value === "string" ? value.trim() : "";

const formatLifestyle = (lifestyle?: string[] | null) =>
  Array.isArray(lifestyle) && lifestyle.length > 0 ? lifestyle.join(", ") : "";

const buildTenantTemplateData = (payload: TenantPayload) => {
  const tenant = payload.tenant ?? {};
  return {
    tenant_name: compact(tenant.name) || "Nuevo inquilino sin nombre",
    tenant_email: compact(tenant.email),
    tenant_phone: compact(tenant.phone),
    tenant_city: compact(tenant.city),
    tenant_locality: compact(tenant.locality),
    tenant_role: compact(tenant.role),
    tenant_rental_goal: compact(tenant.rental_goal),
    tenant_budget: typeof tenant.budget === "number" ? tenant.budget : "",
    tenant_lifestyle: formatLifestyle(tenant.lifestyle),
    tenant_bio: compact(tenant.bio),
    tenant_profile_url: compact(payload.meta?.profile_url ?? ""),
  };
};

const buildPropertyTemplateData = (payload: PropertyPayload) => {
  const property = payload.property ?? {};
  const owner = payload.owner ?? {};
  return {
    property_title: compact(property.title) || "Propiedad sin título",
    property_address: compact(property.address),
    property_city: compact(property.city),
    property_locality: compact(property.locality),
    property_type: compact(property.property_type),
    property_price: typeof property.price === "number" ? property.price : "",
    property_visibility: compact(property.visibility),
    property_available_from: compact(property.available_from),
    property_status: compact(property.status),
    property_url: compact(property.url),
    owner_name: compact(owner.name),
    owner_email: compact(owner.email),
    owner_phone: compact(owner.phone),
  };
};

const buildPlainText = (payload: AdminNotificationPayload) => {
  if (payload.type === "new_tenant") {
    const tenant = payload.tenant ?? {};
    return [
      `Nuevo inquilino registrado: ${tenant.name ?? "sin nombre"}.`,
      tenant.email ? `Email: ${tenant.email}` : undefined,
      tenant.phone ? `Teléfono: ${tenant.phone}` : undefined,
      tenant.city || tenant.locality
        ? `Ubicación: ${[tenant.city, tenant.locality].filter(Boolean).join(", ")}`
        : undefined,
      tenant.role ? `Rol: ${tenant.role}` : undefined,
      tenant.rental_goal ? `Objetivo: ${tenant.rental_goal}` : undefined,
      tenant.budget ? `Presupuesto: ${tenant.budget} €/mes` : undefined,
      payload.meta?.profile_url
        ? `Perfil: ${payload.meta.profile_url}`
        : undefined,
    ]
      .filter(Boolean)
      .join("\n");
  }

  const property = payload.property ?? {};
  const owner = payload.owner ?? {};
  return [
    `Nueva propiedad publicada: ${property.title ?? "sin título"}.`,
    property.address ? `Dirección: ${property.address}` : undefined,
    property.city || property.locality
      ? `Ubicación: ${[property.city, property.locality].filter(Boolean).join(", ")}`
      : undefined,
    property.property_type ? `Tipo: ${property.property_type}` : undefined,
    property.price ? `Precio: ${property.price} €/mes` : undefined,
    property.available_from
      ? `Disponible desde: ${property.available_from}`
      : undefined,
    owner.name ? `Propietario: ${owner.name}` : undefined,
    owner.email ? `Email propietario: ${owner.email}` : undefined,
    property.url ? `Enlace: ${property.url}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const sendgridApiKey = requireEnv("SENDGRID_API_KEY");
    const fromEmail = requireEnv("SENDGRID_FROM_EMAIL");
    const fromName = Deno.env.get("SENDGRID_FROM_NAME") ?? "Equipo MoOn";
    const adminEmail = requireEnv("SENDGRID_ADMIN_TO_EMAIL");
    const templateTenant = requireEnv("SENDGRID_TEMPLATE_ID_ADMIN_NEW_TENANT");
    const templateProperty = requireEnv(
      "SENDGRID_TEMPLATE_ID_ADMIN_NEW_PROPERTY",
    );

    const payload: AdminNotificationPayload = await req.json();
    if (!payload || !payload.type) {
      throw new Error("Invalid request payload: missing notification type.");
    }

    const templateId: Record<NotificationType, string> = {
      new_tenant: templateTenant,
      new_property: templateProperty,
    };

    const dynamicData =
      payload.type === "new_tenant"
        ? buildTenantTemplateData(payload)
        : buildPropertyTemplateData(payload);

    const sendgridPayload = {
      from: {
        email: fromEmail,
        name: fromName,
      },
      personalizations: [
        {
          to: [
            {
              email: adminEmail,
              name: "Equipo MoOn",
            },
          ],
          dynamic_template_data: dynamicData,
        },
      ],
      template_id: templateId[payload.type],
      content: [
        {
          type: "text/plain",
          value: buildPlainText(payload),
        },
      ],
    };

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendgridPayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        "ERROR: SendGrid API returned an error:",
        response.status,
        errorBody,
      );
      throw new Error(
        `SendGrid API error: ${response.status} - ${errorBody || "Unknown error"}`,
      );
    }

    console.log(
      `SUCCESS: Sent admin notification (${payload.type}) to ${adminEmail}. Status: ${response.status}`,
    );

    return new Response(
      JSON.stringify({ message: "Admin notification queued." }),
      {
        status: 202,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error(
      "CRITICAL ERROR in send-admin-notification function:",
      error instanceof Error ? error.message : String(error),
    );
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
