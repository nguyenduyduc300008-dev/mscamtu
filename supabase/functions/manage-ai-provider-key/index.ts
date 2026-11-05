import { createClient } from "npm:@supabase/supabase-js@2";
import { encryptProviderKey } from "../_shared/provider-keys.ts";

type Provider = "gemini" | "openai";
type RequestBody = { action?: unknown; provider?: unknown; apiKey?: unknown };

const corsAllowedOrigins = new Set(
  (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

function jsonResponse(body: unknown, status: number, origin: string | null) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  if (origin && corsAllowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function isProvider(value: unknown): value is Provider {
  return value === "gemini" || value === "openai";
}

async function validateProviderKey(provider: Provider, apiKey: string) {
  const response = provider === "openai"
    ? await fetch("https://api.openai.com/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15_000)
    })
    : await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", {
      headers: { "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(15_000)
    });
  if (!response.ok) throw new Error("The provider rejected the API key.");
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin");
  if (origin && !corsAllowedOrigins.has(origin)) {
    return jsonResponse({ error: "Origin is not allowed." }, 403, null);
  }
  if (request.method === "OPTIONS") {
    if (!origin || !corsAllowedOrigins.has(origin)) {
      return jsonResponse({ error: "Origin is not allowed." }, 403, null);
    }
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      }
    });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, origin);
  }

  const authorization = request.headers.get("Authorization");
  const projectUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authorization || !projectUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Authentication or server configuration is unavailable." }, 500, origin);
  }

  const userClient = createClient(projectUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: "Authentication is required." }, 401, origin);
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400, origin);
  }
  const serviceClient = createClient(projectUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  if (body.action === "status") {
    const { data, error } = await serviceClient
      .from("user_ai_provider_keys")
      .select("provider, updated_at")
      .eq("owner_id", userData.user.id);
    if (error) {
      console.error("Could not read AI provider key status:", error);
      return jsonResponse({ error: "Could not read saved provider settings." }, 500, origin);
    }
    return jsonResponse({ providers: data }, 200, origin);
  }

  if (body.action !== "save" && body.action !== "remove") {
    return jsonResponse({ error: "A supported key action is required." }, 400, origin);
  }
  if (!isProvider(body.provider)) {
    return jsonResponse({ error: "A supported AI provider is required." }, 400, origin);
  }

  if (body.action === "remove") {
    const { error } = await serviceClient
      .from("user_ai_provider_keys")
      .delete()
      .eq("owner_id", userData.user.id)
      .eq("provider", body.provider);
    if (error) {
      console.error("Could not remove AI provider key:", error);
      return jsonResponse({ error: "Could not remove the saved provider key." }, 500, origin);
    }
    return jsonResponse({ removed: true }, 200, origin);
  }

  if (typeof body.apiKey !== "string" || body.apiKey.trim().length < 8 || body.apiKey.length > 4096) {
    return jsonResponse({ error: "Enter a valid API key." }, 400, origin);
  }
  const encryptionSecret = Deno.env.get("AI_KEY_ENCRYPTION_SECRET");
  if (!encryptionSecret || encryptionSecret.length < 32) {
    return jsonResponse({ error: "Admin setup is required: configure a 32+ character AI_KEY_ENCRYPTION_SECRET in Supabase Edge Function Secrets." }, 503, origin);
  }

  const apiKey = body.apiKey.trim();
  try {
    await validateProviderKey(body.provider, apiKey);
  } catch {
    return jsonResponse({ error: "The provider could not validate this key. Check it and the provider account, then try again." }, 422, origin);
  }

  let encrypted: { ciphertext: string; iv: string };
  try {
    encrypted = await encryptProviderKey(encryptionSecret, apiKey);
  } catch (error) {
    console.error("Could not encrypt AI provider key:", error);
    return jsonResponse({ error: "The server could not securely store this key." }, 500, origin);
  }
  const { error } = await serviceClient
    .from("user_ai_provider_keys")
    .upsert({
      owner_id: userData.user.id,
      provider: body.provider,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      updated_at: new Date().toISOString()
    }, { onConflict: "owner_id,provider" });
  if (error) {
    console.error("Could not save encrypted AI provider key:", error);
    return jsonResponse({ error: "The server could not save this key." }, 500, origin);
  }

  return jsonResponse({ saved: true, provider: body.provider }, 200, origin);
});
