import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function cleanText(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Méthode non autorisée." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "";

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse({ error: "Configuration Supabase incomplète dans la fonction Edge." }, 500);
    }
    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      return jsonResponse({ error: "Secrets VAPID manquants dans Supabase." }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Authentification administrateur requise." }, 401);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser();
    const user = userData?.user;
    if (userError || !user) {
      return jsonResponse({ error: "Session administrateur invalide ou expirée." }, 401);
    }

    const service = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: admin, error: adminError } = await service
      .from("eaj_admins")
      .select("display_name, active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !admin || admin.active !== true) {
      return jsonResponse({ error: "Ce compte n'est pas autorisé à envoyer des notifications." }, 403);
    }

    const payload = await req.json().catch(() => ({}));
    const allowedKinds = ["information", "programme", "modification", "cancellation", "document", "update", "important"];
    const allowedAudiences = ["all_active", "all_eaj", "eaj1", "eaj2", "eaj3", "eaj23", "system"];
    const kind = allowedKinds.includes(String(payload?.kind)) ? String(payload.kind) : "information";
    let audience = allowedAudiences.includes(String(payload?.audience)) ? String(payload.audience) : "all_eaj";

    // Règles non contournables côté serveur.
    if (kind === "important") audience = "all_active";
    if (kind === "update") audience = "system";

    const title = cleanText(payload?.title, 80);
    const body = cleanText(payload?.body, 300);
    const url = cleanText(payload?.url || "index.html", 500) || "index.html";

    if (!title || !body) {
      return jsonResponse({ error: "Le titre et le message sont obligatoires." }, 400);
    }

    const createdByName = cleanText(admin.display_name || user.email || "Admin EAJ", 150);

    const { data: notification, error: insertError } = await service
      .from("eaj_notifications")
      .insert({
        kind,
        audience,
        title,
        body,
        url,
        status: "pending",
        created_by: user.id,
        created_by_name: createdByName,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    const { data: subscriptions, error: subscriptionError } = await service
      .from("eaj_push_subscriptions")
      .select("id, endpoint, p256dh, auth, pref_eaj1, pref_eaj2, pref_eaj3, pref_system_updates")
      .eq("enabled", true);

    if (subscriptionError) throw subscriptionError;

    const list = Array.isArray(subscriptions) ? subscriptions : [];
    const targeted = list.filter((sub) => {
      if (audience === "all_active") return true;
      if (audience === "eaj1") return sub.pref_eaj1 === true;
      if (audience === "eaj2") return sub.pref_eaj2 === true;
      if (audience === "eaj3") return sub.pref_eaj3 === true;
      if (audience === "eaj23") return sub.pref_eaj2 === true || sub.pref_eaj3 === true;
      if (audience === "system") return sub.pref_system_updates === true;
      return sub.pref_eaj1 === true || sub.pref_eaj2 === true || sub.pref_eaj3 === true;
    });

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const pushPayload = JSON.stringify({
      kind,
      audience,
      title,
      body,
      url,
      tag: kind === "update" ? "eaj-app-update" : `eaj-${notification.id}`,
    });

    let sent = 0;
    let failed = 0;
    const invalidIds: string[] = [];

    await Promise.allSettled(targeted.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          pushPayload,
          {
            TTL: kind === "important" ? 86400 : 43200,
            urgency: (kind === "important" || kind === "cancellation") ? "high" : "normal",
          },
        );
        sent += 1;
      } catch (error: any) {
        failed += 1;
        const statusCode = Number(error?.statusCode || error?.status || 0);
        if (statusCode === 404 || statusCode === 410) {
          invalidIds.push(sub.id);
        }
        console.error("Push failed", statusCode, error?.message || error);
      }
    }));

    if (invalidIds.length) {
      await service
        .from("eaj_push_subscriptions")
        .update({ enabled: false, updated_at: new Date().toISOString() })
        .in("id", invalidIds);
    }

    const status = failed === 0 ? "sent" : (sent > 0 ? "partial" : "failed");
    await service
      .from("eaj_notifications")
      .update({ status, sent_count: sent, failed_count: failed })
      .eq("id", notification.id);

    return jsonResponse({
      ok: true,
      notificationId: notification.id,
      audience,
      matched: targeted.length,
      sent,
      failed,
      disabledSubscriptions: invalidIds.length,
    });
  } catch (error: any) {
    console.error(error);
    return jsonResponse({ error: error?.message || "Erreur interne lors de l'envoi." }, 500);
  }
});
