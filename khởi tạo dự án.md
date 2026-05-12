Giai đoạn 1: Khởi tạo Project và Cấu hình Môi trường (Setup bằng pnpm) Bạn cần chia dự án thành 2 thư mục rõ ràng: frontend và backend.
Frontend:
Sử dụng lệnh pnpm create vite để khởi tạo project với JavaScript và framework React, sau đó thiết lập thư viện Tailwind CSS
.
Tiếp tục dùng pnpm install để cài đặt các thư viện cốt lõi: react-router-dom, @supabase/supabase-js, và eslint
.
Tạo file .env (hoặc .env.local), chỉ lưu chính xác 2 biến là VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY, tuyệt đối không để lộ bất kỳ Secret nào khác
.
Tắt Source Maps trong file vite.config.js bằng cấu hình build: { sourcemap: false } để bảo mật mã nguồn
.
Backend:
Sử dụng lệnh pnpm init để khởi tạo Node.js.
Sử dụng pnpm install để cài đặt các thư viện: express, cors, dotenv, @supabase/supabase-js, và bcryptjs
.
Cài đặt thêm thư viện resend và chuẩn bị RESEND_API_KEY trong file .env để sử dụng cho tính năng gửi OTP/Email
.
Giai đoạn 2: Thiết lập Database và Policies trên Supabase Trước khi code logic, cần thiết lập kiến trúc cơ sở dữ liệu trên Supabase:
Tạo ENUM Types: Khởi tạo loai_tin ('lost', 'found') và trang_thai_bai_dang ('pending', 'delivered', 'success')
.
Tạo các bảng dữ liệu: Bao gồm danh_muc, nguoi_dung (ràng buộc email định dạng %@husc.edu.vn), bai_dang, yeu_cau_nhan_do, bao_cao, và tin_nhan
. Chèn dữ liệu mẫu cho bảng danh_muc (như Điện thoại & Máy tính bảng, Ví & Tiền mặt...)
.
Thiết lập Policies (RLS): Kích hoạt RLS để bảo vệ dữ liệu. Ví dụ:
Admin có toàn quyền thêm/sửa/xóa danh mục, trong khi mọi người chỉ có thể xem
.
Người dùng chỉ tạo và cập nhật bài đăng cá nhân của mình, mọi người được xem bài đăng
.
Chỉ người bị mất đồ mới được gửi yêu cầu nhận đồ (Claim)
.
Bảng tin nhắn giới hạn chỉ những người trong cuộc mới được phép xem và gửi tin nhắn
.
Giai đoạn 3: Phát triển Backend Proxy và Core Logic Mục tiêu là không bao giờ để Frontend kết nối trực tiếp với DB cho các tác vụ nghiệp vụ quan trọng
.
Khởi tạo Supabase Client: Dùng "Service Role Key" trên server để giúp Backend có quyền "Admin" đi xuyên qua RLS của Supabase
.
Viết Middleware: Tạo middleware authenticate để giải mã JWT xác định danh tính người gọi, và requireAdmin để kiểm tra phân quyền thông qua cột vai trò
.
Xây dựng API an toàn: Mọi logic liên quan đến đăng nhập và đăng ký phải gọi về Backend
. Trước khi lưu vào database, cần mã hóa mật khẩu bằng bcryptjs
. Sau khi sử dụng xong các dữ liệu nhạy cảm như mã OTP, cần phải dọn sạch ngay lập tức
.
Giai đoạn 4: Thiết lập "Zero-Secret" Frontend Frontend sẽ đóng vai trò hiển thị và nhận tương tác mà không chứa bất kỳ logic nghiệp vụ cốt lõi hay secret nào
.
Phát triển API Fetch: Không hardcode URL Backend mà phải gọi thông qua biến môi trường. Viết một helper apiFetch dùng chung để tự động đính kèm Token vào Header mỗi khi có lệnh gọi API về Backend
.
Luồng giao tiếp chuẩn: Frontend sẽ chỉ nhận Token và thông tin cơ bản sau khi đăng nhập. Luồng chuẩn sẽ đi từ: Frontend (gửi Token) ➡️ Backend (Xác thực & phân quyền) ➡️ Database (truy vấn bằng quyền Service Role) ➡️ Backend (Lọc bỏ mọi dữ liệu nhạy cảm) ➡️ Frontend hiển thị dữ liệu an toàn
.
Giai đoạn 5: Chuẩn bị Cấu hình Deploy Dù code trên local, cần lưu ý trước các tệp tin hệ thống để tránh rò rỉ:
Đảm bảo thêm file .env vào .gitignore ở cả 2 thư mục frontend và backend để tránh việc mã bảo mật bị push nhầm lên Git
.
Cấu hình sẵn biến môi trường trên Render cho Backend và trên Vercel cho Frontend
.
Đảm bảo cả Backend và Frontend đều sẽ sử dụng giao thức HTTPS khi đưa lên môi trường thật
.

lưu ý : port sử dụng để phát triển code trong local là 3002 ( tránh trùng lặp với các port trước)