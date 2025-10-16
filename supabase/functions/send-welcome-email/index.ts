// supabase/functions/send-welcome-email/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Add Deno type declaration for non-Deno environments
declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

// Define the expected request body structure
interface UserProfile {
  email: string;
  name: string;
  role: 'INQUILINO' | 'PROPIETARIO' | 'ADMIN';
}

console.log("DEBUG: send-welcome-email function booting up!");

serve(async (req) => {
  // 1. Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      } 
    });
  }

  try {
    console.log("DEBUG: Function invoked. Starting email process.");

    // 2. Securely get secrets and validate them
    console.log("DEBUG: Checking for environment variables (secrets)...");
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const templateIdInquilino = Deno.env.get("SENDGRID_TEMPLATE_ID_INQUILINO");
    const templateIdPropietario = Deno.env.get("SENDGRID_TEMPLATE_ID_PROPIETARIO");
    const fromEmail = Deno.env.get("SENDGRID_FROM_EMAIL");

    const secrets = {
      sendgridApiKey,
      templateIdInquilino,
      templateIdPropietario,
      fromEmail,
    };

    const missingSecrets = Object.entries(secrets)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    
    if (missingSecrets.length > 0) {
      throw new Error(`CRITICAL: Missing required environment variables (secrets): ${missingSecrets.join(', ')}`);
    }
    console.log("DEBUG: All required secrets found.");
    
    // 3. Parse and validate the user profile from the request body
    console.log("DEBUG: Parsing request body...");
    const userProfile: UserProfile = await req.json();
    if (!userProfile.email || !userProfile.name || !userProfile.role) {
      throw new Error(`Invalid request body. Received: ${JSON.stringify(userProfile)}`);
    }
    console.log("DEBUG: Request body parsed successfully:", userProfile);

    // 4. Select the correct template based on the user's role
    let templateId: string;
    switch (userProfile.role) {
      case 'INQUILINO':
        templateId = templateIdInquilino!;
        console.log(`DEBUG: Role is INQUILINO. Selected template ID: ${templateId}`);
        break;
      case 'PROPIETARIO':
        templateId = templateIdPropietario!;
        console.log(`DEBUG: Role is PROPIETARIO. Selected template ID: ${templateId}`);
        break;
      default:
        console.log(`DEBUG: No email template configured for role: '${userProfile.role}'. Skipping email.`);
        return new Response(JSON.stringify({ message: `No template for role ${userProfile.role}` }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }

    // 5. Construct the payload for the SendGrid API
    const sendgridPayload = {
      from: {
        email: fromEmail!,
        name: "El equipo de MoOn" // A recognizable sender name improves deliverability.
      },
      personalizations: [
        {
          to: [
            {
              email: userProfile.email,
              name: userProfile.name,
            },
          ],
          // Make sure this variable name 'name' matches *exactly* what you have in your SendGrid template, like {{name}}.
          dynamic_template_data: {
            name: userProfile.name, 
          },
        },
      ],
      template_id: templateId,
      // DIAGNOSTIC FALLBACK: This content is sent if the template fails to render for any reason.
      // If you receive this plain text email, the issue is with your SendGrid template configuration.
      content: [{
        type: 'text/plain',
        value: `Hola ${userProfile.name},\n\n¡Bienvenido/a a MoOn! Estamos muy contentos de tenerte con nosotros.\n\n(Este es un email de respaldo. Si lo estás viendo, por favor revisa la configuración de tu plantilla en SendGrid).\n\nEl equipo de MoOn.`
      }]
    };

    console.log("DEBUG: Constructed SendGrid payload:", JSON.stringify(sendgridPayload, null, 2));

    // 6. Send the request to SendGrid
    console.log("DEBUG: Sending request to SendGrid API...");
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendgridPayload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("ERROR: SendGrid API returned an error:", { status: response.status, body: errorBody });
      throw new Error(`SendGrid API error: ${response.status} - ${JSON.stringify(errorBody.errors)}`);
    }

    console.log(`SUCCESS: Successfully sent welcome email to ${userProfile.email}. Status: ${response.status}`);

    // 7. Return a success response
    return new Response(JSON.stringify({ message: "Welcome email sent successfully." }), {
      status: 202, // 202 Accepted is more appropriate for async tasks like email
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error("CRITICAL ERROR in send-welcome-email function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
