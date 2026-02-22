import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response(JSON.stringify({ error: "No record" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const ONESIGNAL_APP_ID = "c40f393d-a89b-4cbe-b1c0-64cf7aa0cbc1";
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!ONESIGNAL_REST_API_KEY) {
      console.error("Missing ONESIGNAL_REST_API_KEY");
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const orderType =
      record.order_type === "family"
        ? "Menu Familial"
        : record.order_type === "enterprise"
        ? "Menu Entreprise"
        : "Tacos";

    const total = record.total?.toLocaleString?.() || record.total;

    const notifResponse = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          included_segments: ["Subscribed Users"],
          headings: { en: "🛒 Nouvelle commande !" },
          contents: {
            en: `${orderType} - ${total} FCFA | Tel: ${record.phone}`,
          },
          url: "https://mmtacosbamako.com/admin/login",
        }),
      }
    );

    const notifResult = await notifResponse.json();
    console.log("OneSignal response:", notifResult);

    return new Response(JSON.stringify({ success: true, notifResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
