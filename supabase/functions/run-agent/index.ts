import { createClient } from "npm:@supabase/supabase-js@2";

const agentInstructions: Record<string, string> = {
  coordinator: "Phân tích yêu cầu, chia thành các bước cụ thể, chỉ ra kết quả và rủi ro cần người dùng xác nhận. Không giả vờ đã giao cho agent khác.",
  research: "Nghiên cứu và tổng hợp thông tin. Phân biệt dữ kiện đã biết với giả định; không bịa nguồn, đường dẫn hoặc số liệu.",
  social: "Soạn nội dung mạng xã hội rõ ràng, đúng đối tượng và giọng thương hiệu theo yêu cầu. Đưa ra bản nháp để duyệt, không tuyên bố đã đăng.",
  "short-video": "Phát triển kịch bản video ngắn hoặc ảnh cuộn gồm hook, từng cảnh, thời lượng, chữ trên màn hình và CTA. Chỉ đưa ra bản nháp.",
  publisher: "Lập checklist và lịch phát hành từ nội dung đã được duyệt. Không truy cập tài khoản hoặc tự xuất bản.",
  sales: "Soạn phản hồi chăm sóc khách hàng thân thiện dựa trên thông tin đã cung cấp. Không bịa chính sách, tình trạng đơn hoặc cam kết.",
  video: "Lập kế hoạch sản xuất/hậu kỳ gồm shot list, nhịp dựng, lời thoại và tài sản cần có. Không tuyên bố đã render video.",
  training: "Soạn quy trình đào tạo từng bước, ví dụ, tiêu chí kiểm tra và lưu ý an toàn. Không yêu cầu người dùng tiết lộ bí mật.",
  landing: "Đề xuất cấu trúc, nội dung và checklist responsive/accessibility cho trang web. Không tự xuất bản hoặc thay đổi tài khoản.",
  "brand-review": "Rà soát nhất quán thương hiệu, lỗi nội dung và điểm cần duyệt. Nêu vấn đề, mức độ và cách sửa; không tự phê duyệt.",
  "brand-voice": "Duy trì giọng điệu và thông điệp theo guideline được cung cấp. Không tự coi đề xuất mới là chính sách đã duyệt.",
  quality: "Kiểm tra độ rõ ràng, chính xác, chính tả và checklist kênh. Nêu rõ dữ kiện cần xác minh và để người dùng duyệt cuối."
};

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

async function updateTask(
  userClient: ReturnType<typeof createClient>,
  taskId: string,
  updates: Record<string, string | number | null>
) {
  const { error } = await userClient
    .from("ai_tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) throw error;
}

async function generateOpenAI(prompt: string, instruction: string) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OpenAI API key is not configured.");
  const model = Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: 3000,
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: prompt }
      ]
    }),
    signal: AbortSignal.timeout(90_000)
  });
  if (!response.ok) throw new Error(`OpenAI returned HTTP ${response.status}.`);
  const data = await response.json();
  const result = data.choices?.[0]?.message?.content;
  if (typeof result !== "string" || !result.trim()) throw new Error("OpenAI returned an empty result.");
  return result.trim();
}

async function generateGemini(prompt: string, instruction: string) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Gemini API key is not configured.");
  const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 3000 }
      }),
      signal: AbortSignal.timeout(90_000)
    }
  );
  if (!response.ok) throw new Error(`Gemini returned HTTP ${response.status}.`);
  const data = await response.json();
  const result = data.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || "")
    .join("")
    .trim();
  if (typeof result !== "string" || !result) throw new Error("Gemini returned an empty result.");
  return result;
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
  if (!authorization || !projectUrl || !anonKey) {
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

  let body: { taskId?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400, origin);
  }
  if (typeof body.taskId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.taskId)) {
    return jsonResponse({ error: "A valid task ID is required." }, 400, origin);
  }

  const { data: task, error: taskError } = await userClient
    .from("ai_tasks")
    .select("id, owner_id, agent_id, provider, prompt, status")
    .eq("id", body.taskId)
    .eq("owner_id", userData.user.id)
    .single();
  if (taskError || !task) {
    return jsonResponse({ error: "The task was not found." }, 404, origin);
  }
  if (!agentInstructions[task.agent_id]) {
    return jsonResponse({ error: "The selected agent is not configured." }, 400, origin);
  }
  if (task.status !== "queued") {
    return jsonResponse({ error: "The task has already been started." }, 409, origin);
  }

  if (task.provider !== "gemini" && task.provider !== "openai") {
    return jsonResponse({ error: "The selected AI provider is not supported." }, 400, origin);
  }

  const { data: claimedTask, error: claimError } = await userClient
    .from("ai_tasks")
    .update({ status: "in_progress", progress: 10, error: null, updated_at: new Date().toISOString() })
    .eq("id", task.id)
    .eq("status", "queued")
    .select("id")
    .maybeSingle();
  if (claimError) {
    console.error("Could not claim AI task:", claimError);
    return jsonResponse({ error: "The task could not be started." }, 500, origin);
  }
  if (!claimedTask) {
    return jsonResponse({ error: "The task has already been started." }, 409, origin);
  }

  try {
    await updateTask(userClient, task.id, { progress: 35 });
    const result = task.provider === "gemini"
      ? await generateGemini(task.prompt, agentInstructions[task.agent_id])
      : task.provider === "openai"
        ? await generateOpenAI(task.prompt, agentInstructions[task.agent_id])
        : null;
    if (!result) {
      await updateTask(userClient, task.id, {
        status: "failed",
        error: "Chưa hỗ trợ nhà cung cấp AI này."
      });
      return jsonResponse({ error: "Unsupported AI provider." }, 400, origin);
    }
    await updateTask(userClient, task.id, { progress: 90 });
    await updateTask(userClient, task.id, {
      status: "completed",
      progress: 100,
      result,
      completed_at: new Date().toISOString()
    });
    return jsonResponse({ status: "completed" }, 200, origin);
  } catch (error) {
    console.error("AI task failed:", error);
    try {
      await updateTask(userClient, task.id, {
        status: "failed",
        error: "AI không thể xử lý nhiệm vụ. Kiểm tra API key, hạn mức, model và thử giao lại."
      });
    } catch (updateError) {
      console.error("Could not save failed AI task status:", updateError);
    }
    return jsonResponse({ error: "AI processing failed. Check provider configuration and try again." }, 502, origin);
  }
});
