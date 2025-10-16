// supabase/functions/sync-tenant-to-fluentcrm/index.ts

// FIX: Add type declaration for the Deno global object to resolve the
// "Cannot find name 'Deno'" TypeScript error. This is required for
// type-checking environments that are not pre-configured with Deno's globals.
declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    // Obtiene tu webhook URL de forma segura desde los secrets de Supabase.
    const webhookUrl = Deno.env.get("FLUENTCRM_TENANT_WEBHOOK_URL");
    if (!webhookUrl) {
      throw new Error("La variable FLUENTCRM_TENANT_WEBHOOK_URL no está configurada en los secrets.");
    }

    // El trigger de la base de datos nos enviará el perfil completo del usuario.
    const userProfile = await req.json();

    // Dividimos el nombre completo en nombre y apellido para Fluent CRM.
    const nameParts = (userProfile.name || '').trim().split(' ');
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ');

    // Preparamos el payload con los datos para Fluent CRM.
    // Asegúrate de que los 'keys' de los campos personalizados (ej: 'locality', 'age')
    // coincidan con los "Custom Field Slug" que tienes en Fluent CRM.
    const crmPayload = {
      email: userProfile.email,
      first_name: firstName,
      last_name: lastName,
      phone: userProfile.phone,
      city: userProfile.city,
      tags: ["Inquilino", "Perfil Completado"], // Añadimos etiquetas para segmentar
      // --- CAMPOS PERSONALIZADOS ---
      locality: userProfile.locality,
      age: userProfile.age,
      rental_goal: userProfile.rental_goal,
      noise_level: userProfile.noise_level,
      budget: userProfile.budget,
      birth_country: userProfile.birth_country,
      religion: userProfile.religion,
      sexual_orientation: userProfile.sexual_orientation,
      interests: (userProfile.interests || []).join(', '), // Convertimos el array de intereses a texto
      lifestyle: (userProfile.lifestyle || []).join(', '), // Convertimos el array de estilo de vida a texto
    };
    
    console.log(`Enviando perfil de ${userProfile.email} a Fluent CRM...`);

    // Realizamos la llamada al webhook de Fluent CRM.
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(crmPayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error de Fluent CRM: ${response.status} ${errorBody}`);
    }

    console.log(`Perfil de ${userProfile.email} enviado correctamente a Fluent CRM.`);

    return new Response(JSON.stringify({ message: "Contacto sincronizado con Fluent CRM" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error en la Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
