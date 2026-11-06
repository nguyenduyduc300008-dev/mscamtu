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
   - Thêm URI callback `https://<project-ref>.supabase.co/auth/v1/callback` vào **Authorized redirect URIs** của Google, thay `<project-ref>` bằng project ref của đúng Supabase project.
   - Trong **Supabase → Authentication → Sign In / Providers → Google**, bật provider và nhập Google **Client ID** cùng **Client Secret**. Chỉ nhập Client Secret trực tiếp trong Supabase, không đưa vào frontend, repository hoặc chat.
   - Giữ tắt đăng ký công khai; đăng nhập Google bằng chính địa chỉ email của tài khoản được mời trong Supabase. Nếu ứng dụng Google đang ở chế độ kiểm thử, thêm tài khoản đăng nhập vào danh sách test users trong Google Cloud Console.

## 2. Tạo bảng và triển khai Edge Function

Cài Supabase CLI theo hướng dẫn chính thức, sau đó chạy từ thư mục repository:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Trong **Supabase → Edge Functions → Secrets**, đặt các secrets sau. Lấy URL và anon/publishable key từ **Project Settings → API**. Cấu hình dùng chung nằm trong Edge Function Secrets; API key riêng theo tài khoản được mã hóa ở backend:

| Secret | Giá trị |
|---|---|
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_ANON_KEY` | anon/publishable key của project |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key của project; chỉ lưu trong Edge Function Secrets, tuyệt đối không đưa vào frontend hoặc GitHub Pages variables |
| `AI_KEY_ENCRYPTION_SECRET` | Chuỗi bí mật ngẫu nhiên tối thiểu 32 ký tự, chỉ lưu trong Supabase Edge Function Secrets; dùng để mã hóa API key riêng của từng tài khoản |
| `ALLOWED_ORIGINS` | `https://nguyenduyduc300008-dev.github.io,http://127.0.0.1:5173,http://localhost:5173` |

Trong **Supabase → Edge Functions → Secrets**, đặt `AI_KEY_ENCRYPTION_SECRET` bằng một giá trị ngẫu nhiên mạnh dài ít nhất 32 ký tự. Không dùng API key của nhà cung cấp làm secret này. Giữ secret ổn định và có bản sao an toàn: thay secret sẽ khiến API key đã lưu không giải mã được, cần kết nối lại. Để hỗ trợ cấu hình API key dùng chung cho toàn hệ thống (tùy chọn), có thể đặt `OPENAI_API_KEY` hoặc `GEMINI_API_KEY`; API key riêng được lưu trong giao diện sẽ được ưu tiên. Có thể đặt model bằng `OPENAI_MODEL` và `GEMINI_MODEL`; mặc định lần lượt là `gpt-4.1-mini` và `gemini-2.5-flash`.

Sau khi migration đã được áp dụng và secrets đã cấu hình, triển khai cả hai Edge Functions:

```powershell
npx supabase functions deploy manage-ai-provider-key
npx supabase functions deploy run-agent
```

### Dùng một Gemini API key chung cho văn phòng

GitHub Pages không thể tự tạo hoặc tự lấy API key từ Google. Quản trị viên cần tự tạo key trong [Google AI Studio](https://aistudio.google.com/api-keys), sau đó lưu key ở backend:

1. Mở đúng Supabase project mà website dùng → **Edge Functions → Secrets**.
2. Thêm secret tên `GEMINI_API_KEY`, giá trị là key vừa tạo. Không thêm key này vào GitHub, mã nguồn, `.env`, hay `VITE_*`.
3. Đảm bảo GitHub Actions Variables `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trỏ tới chính project đó; `VITE_SUPABASE_URL` phải khớp `SUPABASE_URL` của Edge Functions.
4. Deploy lại hai function bằng lệnh phía trên. Đăng nhập website, mở **Kết nối API AI**; Gemini sẽ hiện **Đang dùng API key chung trên máy chủ**. Chọn **Google Gemini** khi giao nhiệm vụ.

Key chung được dùng cho mọi tài khoản trên văn phòng và tiêu thụ quota của tài khoản Google sở hữu key. Nếu có API key riêng đã kết nối, key riêng được ưu tiên; xóa key riêng sẽ quay lại dùng key chung. Cần tạo tài khoản quản trị và đăng nhập Supabase như hướng dẫn bên trên.

Sau khi triển khai, đăng nhập trang Văn phòng AI, chọn **Kết nối API AI**, chọn nhà cung cấp, nhập API key mới và bấm **Kiểm tra và kết nối**. Backend sẽ kiểm tra key với nhà cung cấp rồi mã hóa bằng AES-GCM trước khi lưu. Khóa mã hóa không được gửi xuống trình duyệt; bảng key không cho phép người dùng đọc trực tiếp. Có thể xóa key đã lưu ngay trong giao diện. Không nhập API key vào trang trước khi migration, Edge Function và secret mã hóa đã được cấu hình.

Gemini API có quota miễn phí giới hạn tùy model, khu vực và điều khoản Google; OpenAI API tính phí riêng theo sử dụng và không mặc nhiên nằm trong gói ChatGPT. Không dán API key vào GitHub hoặc chat. Nếu key từng bị chia sẻ/lộ, thu hồi key đó tại nhà cung cấp và tạo key mới.

Trang **Lịch sử giao việc** có bộ lọc ngày, AI Agent và trạng thái. **Báo cáo tuần** tổng hợp tuần đã hoàn thành gần nhất theo giờ máy, chuyển sang kỳ mới vào Thứ Hai lúc 09:00 và hiển thị trên trang. Khi trang đang mở, dữ liệu làm mới mỗi 5 giây; mở lại trang để xem kỳ mới nếu máy đã đóng đúng giờ báo cáo. Không gửi email/thông báo khi trang đóng. Lịch sử tải 100 nhiệm vụ mới nhất.

Phần **Tài chính công ty** trên Tổng quan lưu doanh thu và lợi nhuận theo ngày bằng VND. Số liệu nhập thủ công, dùng chung cho tài khoản đã đăng nhập và không tự tính từ đơn hàng. Để bật tính năng, áp dụng migration `supabase/migrations/20261106000200_create_company_daily_financials.sql` bằng `npx supabase db push`.

Bảng nhiệm vụ được tạo từ migration `supabase/migrations/20261105000100_create_ai_tasks.sql`, bật Row Level Security và chỉ cho tài khoản đã đăng nhập đọc/sửa nhiệm vụ của chính mình. Hai Edge Function đặt `verify_jwt = false` vì tùy chọn kiểm tra JWT legacy ở gateway không hỗ trợ mọi signing key hiện hành. Thay vào đó, mỗi function tự xác minh phiên bằng `auth.getUser()` trước khi xử lý; không bỏ bước kiểm tra này. API key riêng nằm trong bảng chỉ Edge Function dùng service role truy cập được và không đọc được trực tiếp qua Data API. API key đã mã hóa được dùng ở backend cho nhiệm vụ tương ứng; agent không thực thi lệnh, đăng bài hay tác động tài khoản bên ngoài.

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
