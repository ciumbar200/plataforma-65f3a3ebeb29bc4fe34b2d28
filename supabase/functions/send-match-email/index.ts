import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

interface MatchUserPayload {
  email: string;
  name: string;
  city?: string | null;
  avatar_url?: string | null;
}

interface MatchPayload {
  userA: MatchUserPayload;
  userB: MatchUserPayload;
  compatibility?: number | null;
  nextStepsUrl?: string | null;
}

console.log("DEBUG: send-match-email function booting up!");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const templateIdMatch = Deno.env.get("SENDGRID_TEMPLATE_ID_MATCH");
    const fromEmail = Deno.env.get("SENDGRID_FROM_EMAIL");
    const fromName = Deno.env.get("SENDGRID_FROM_NAME") ?? "Equipo MoOn";

    const missingSecrets = Object.entries({
      SENDGRID_API_KEY: sendgridApiKey,
      SENDGRID_TEMPLATE_ID_MATCH: templateIdMatch,
      SENDGRID_FROM_EMAIL: fromEmail,
    })
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingSecrets.length > 0) {
      throw new Error(`CRITICAL: Missing required environment variables: ${missingSecrets.join(", ")}`);
    }

    const payload: MatchPayload = await req.json();
    if (!payload?.userA?.email || !payload?.userB?.email || !payload.userA.name || !payload.userB.name) {
      throw new Error("Invalid payload received. Expecting userA and userB with name and email.");
    }

    const sanitizedCompatibility =
      typeof payload.compatibility === "number" && !Number.isNaN(payload.compatibility)
        ? Math.round(payload.compatibility)
        : null;

    const dynamicDataFor = (recipient: MatchUserPayload, counterpart: MatchUserPayload) => ({
      recipient_name: recipient.name,
      counterpart_name: counterpart.name,
      counterpart_city: counterpart.city ?? "",
      compatibility: sanitizedCompatibility,
      next_steps_url: payload.nextStepsUrl ?? "",
    });

    const sendgridPayload = {
      from: {
        email: fromEmail!,
        name: fromName,
      },
      personalizations: [
        {
          to: [
            {
              email: payload.userA.email,
              name: payload.userA.name,
            },
          ],
          dynamic_template_data: dynamicDataFor(payload.userA, payload.userB),
        },
        {
          to: [
            {
              email: payload.userB.email,
              name: payload.userB.name,
            },
          ],
          dynamic_template_data: dynamicDataFor(payload.userB, payload.userA),
        },
      ],
      template_id: templateIdMatch!,
      content: [
        {
          type: "text/plain",
          value:
            `Hola ${payload.userA.name} y ${payload.userB.name},\n\n` +
            `¡Enhorabuena! Es un match dentro de MoOn.\n` +
            `Si ves este mensaje en lugar de la plantilla, revisa la configuración del template ${templateIdMatch} en SendGrid.\n\n` +
            `Equipo MoOn.`,
        },
      ],
    };

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendgridPayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("ERROR: SendGrid API returned an error:", response.status, errorBody);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log(
      `SUCCESS: Match email sent to ${payload.userA.email} and ${payload.userB.email}. Status: ${response.status}`,
    );

    return new Response(
      JSON.stringify({ message: "Match email sent successfully." }),
      {
        status: 202,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("CRITICAL ERROR in send-match-email function:", error);
    return new Response(JSON.stringify({ error: error.message ?? "Unknown error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
