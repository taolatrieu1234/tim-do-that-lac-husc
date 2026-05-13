Giai đoạn 2: Quản lý Danh mục và Xây dựng tính năng Đăng tin (Core Posting)
Quản lý danh mục (Dành cho Admin): Xây dựng các API và giao diện cho phép Quản trị viên Thêm, Sửa, Xóa các danh mục đồ vật (ví dụ: Điện thoại, Ví tiền...) để làm cơ sở phân loại bài đăng
.
Đăng tin (Mất đồ & Nhặt được đồ): Xây dựng form cho người dùng tạo bài đăng. Các thông tin bắt buộc bao gồm: Tiêu đề, mô tả, vị trí, phân loại danh mục và hình ảnh
.
Giai đoạn 3: Phát triển hệ thống So khớp và Yêu cầu nhận đồ (Matching & Claiming)
So khớp tự động: Tích hợp Backend API (Node.js) để chạy ngầm kịch bản tự động đối chiếu các bài đăng "Mất đồ" với "Nhặt được đồ" ngay khi có bài đăng mới và gửi thông báo nếu trùng khớp
.
Gửi Yêu cầu nhận đồ (Claim): Cho phép người mất đồ nhấn nút "Đây là đồ của tôi" tại bài đăng Found. Yêu cầu họ bắt buộc phải tải lên bằng chứng sở hữu (ảnh chụp cũ hoặc mô tả đặc điểm nhận dạng ẩn như vết xước, mật khẩu)
.
Duyệt Yêu cầu (Chấp nhận Claim): Giao diện cho người nhặt xem xét bằng chứng và nhấn "Chấp nhận". Lúc này trạng thái bài đăng sẽ chuyển sang "Pending" (đang chờ nhận đồ)


Giai đoạn 6: Xây dựng Hệ thống Hậu kiểm (Moderation) và Thống kê (Reporting) cho Admin
Báo cáo bài đăng (Report): Cho phép người dùng báo cáo các bài đăng có dấu hiệu lừa đảo, spam hoặc nội dung nhạy cảm
.
Xử lý vi phạm: Xây dựng giao diện Admin Dashboard để Admin xem xét các báo cáo, thực hiện Xóa bài đăng vi phạm và Khóa tài khoản của những người dùng lạm dụng/vi phạm nội quy
.
Thống kê và Trích xuất báo cáo: Viết chức năng tự động tổng hợp lịch sử các món đồ đã "Trao trả thành công" theo mốc thời gian (tuần, tháng...) và xuất file báo cáo phục vụ nhà trường
.