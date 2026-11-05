# Thiết lập Văn phòng AI trên GitHub Pages

Trang văn phòng là frontend tĩnh trên GitHub Pages. Đăng nhập, database và gọi AI chạy qua Supabase; không đặt OpenAI/Gemini secret trong frontend, repository, GitHub Pages variables hay tin nhắn.

## 1. Tạo project Supabase

1. Tạo project tại [supabase.com/dashboard](https://supabase.com/dashboard) và lưu database password an toàn.
2. Trong **Authentication → Providers → Email**, tắt **Allow new users to sign up**. Đây là cấu hình tài khoản quản trị dùng chung đã chọn; không tạo public signup.
3. Trong **Authentication → Users**, tạo tài khoản quản trị bằng email/password. Cấp mật khẩu riêng và không commit/lưu trong repo.
4. Trong **Authentication → URL Configuration**, đặt Site URL theo URL Pages của repository và thêm URL local để phát triển, ví dụ:
   - `https://nguyenduyduc300008-dev.github.io/mscamtu/`
   - `http://127.0.0.1:5173/`

## 2. Tạo bảng và triển khai Edge Function

Cài Supabase CLI theo hướng dẫn chính thức, sau đó chạy từ thư mục repository:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy run-agent
```

Trong **Supabase → Edge Functions → Secrets**, đặt các secrets sau. Lấy URL và anon/publishable key từ **Project Settings → API**. API keys chỉ lưu trong Edge Function secrets:

| Secret | Giá trị |
|---|---|
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_ANON_KEY` | anon/publishable key của project |
| `OPENAI_API_KEY` | API key từ tài khoản OpenAI, nếu dùng ChatGPT |
| `GEMINI_API_KEY` | API key từ Google AI Studio, nếu dùng Gemini |
| `ALLOWED_ORIGINS` | `https://nguyenduyduc300008-dev.github.io,http://127.0.0.1:5173,http://localhost:5173` |

Hai nhà cung cấp AI được chọn riêng cho từng nhiệm vụ. Có thể đặt model không bắt buộc bằng `OPENAI_MODEL` và `GEMINI_MODEL`; mặc định lần lượt là `gpt-4.1-mini` và `gemini-2.5-flash`. Mỗi lời giao việc được gửi tới nhà cung cấp đã chọn và có thể phát sinh phí theo tài khoản/quota của bạn.

Bảng được tạo từ migration `supabase/migrations/20261105000100_create_ai_tasks.sql`, bật Row Level Security và chỉ cho tài khoản đã đăng nhập đọc/sửa nhiệm vụ của chính mình. Function xác minh JWT, truy cập dữ liệu theo RLS bằng phiên người dùng (không cần service-role key) và không thực thi lệnh, đăng bài hay tác động tài khoản bên ngoài.

## 3. Cấu hình GitHub Pages

Trong repository GitHub vào **Settings → Secrets and variables → Actions → Variables**, tạo:

| Repository variable | Giá trị |
|---|---|
| `VITE_SUPABASE_URL` | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | anon/publishable key (được phép công khai; bảo vệ dữ liệu bằng RLS) |

Đây là thông tin frontend công khai, không phải API key của OpenAI/Gemini. Workflow Pages lấy hai biến này khi build. Push lên nhánh `main` hoặc chạy **Actions → Deploy static site to GitHub Pages → Run workflow** để phát hành.

Đường dẫn trang mới:

`https://nguyenduyduc300008-dev.github.io/mscamtu/office.html`

Nếu tên tài khoản/repository hoặc Pages base URL khác, thay URL trong Auth URL Configuration và `ALLOWED_ORIGINS` cho đúng.

## 4. Chạy local

Tạo file `.env` từ `.env.example`, điền Supabase URL và anon/publishable key (không dùng service-role/API key ở đây), rồi:

```powershell
npm ci
npm run dev
```

Mở `http://127.0.0.1:5173/office.html`. Các nhiệm vụ và tiến độ được tải lại từ Supabase; tiến độ là các mốc xử lý của backend, không phải ước lượng token/thời gian còn lại. Chỉ tài khoản quản trị được tạo trong Supabase đăng nhập được.

Nếu thiếu cấu hình Supabase, trang chủ động dừng ở màn hình đăng nhập và báo cần cấu hình; không chuyển sang chế độ giả lập hoặc lưu mật khẩu trên trình duyệt.
