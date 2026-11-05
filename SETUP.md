# Thiết lập Văn phòng AI trên GitHub Pages

Trang văn phòng là frontend tĩnh trên GitHub Pages. Đăng nhập, database và gọi AI chạy qua Supabase; không đặt OpenAI/Gemini secret trong frontend, repository, GitHub Pages variables hay tin nhắn.

## 1. Tạo project Supabase

1. Tạo project tại [supabase.com/dashboard](https://supabase.com/dashboard) và lưu database password an toàn.
2. Trong **Authentication → Providers → Email**, tắt **Allow new users to sign up**. Đây là cấu hình tài khoản quản trị dùng chung đã chọn; không tạo public signup.
3. Trong **Authentication → Users**, tạo hoặc mời tài khoản quản trị. Không commit/lưu mật khẩu trong repo.
4. Trong **Authentication → URL Configuration**, đặt Site URL và Redirect URLs trỏ tới trang văn phòng, ví dụ:
   - Site URL: `https://nguyenduyduc300008-dev.github.io/mscamtu/office.html`
   - Redirect URL local: `http://127.0.0.1:5173/office.html`
5. Để bật đăng nhập Google:
   - Trong Google Cloud Console, tạo OAuth client loại **Web application** và cấu hình màn hình đồng ý OAuth.
   - Thêm URI callback sau vào **Authorized redirect URIs** của Google: `https://afkhbcgookwwqvvvwxsx.supabase.co/auth/v1/callback`
   - Trong **Supabase → Authentication → Sign In / Providers → Google**, bật provider và nhập Google **Client ID** cùng **Client Secret**. Chỉ nhập Client Secret trực tiếp trong Supabase, không đưa vào frontend, repository hoặc chat.
   - Giữ tắt đăng ký công khai; đăng nhập Google bằng chính địa chỉ email của tài khoản được mời trong Supabase. Nếu ứng dụng Google đang ở chế độ kiểm thử, thêm tài khoản đăng nhập vào danh sách test users trong Google Cloud Console.

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

Nếu cần đặt hoặc quên mật khẩu, nhập email ở màn hình đăng nhập và chọn **Quên mật khẩu?**. Liên kết trong email sẽ quay lại trang văn phòng để đặt mật khẩu mới; cần cấu hình SMTP/email trong Supabase để gửi thư thực tế.

Sau khi cấu hình Google OAuth trong Supabase, nút **Đăng nhập bằng Google** sẽ chuyển tới Google rồi quay lại trang văn phòng. Redirect URL trang Pages đã có trong Auth URL Configuration; nếu đổi domain, cần cập nhật URL allowlist trong Supabase.

Nếu thiếu cấu hình Supabase, trang chủ động dừng ở màn hình đăng nhập và báo cần cấu hình; không chuyển sang chế độ giả lập hoặc lưu mật khẩu trên trình duyệt.
