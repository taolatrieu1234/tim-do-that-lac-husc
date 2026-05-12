Giai đoạn 2: Quản lý Danh mục và Xây dựng tính năng Đăng tin (Core Posting)
Quản lý danh mục (Dành cho Admin): Xây dựng các API và giao diện cho phép Quản trị viên Thêm, Sửa, Xóa các danh mục đồ vật (ví dụ: Điện thoại, Ví tiền...) để làm cơ sở phân loại bài đăng
.
Đăng tin (Mất đồ & Nhặt được đồ): Xây dựng form cho người dùng tạo bài đăng. Các thông tin bắt buộc bao gồm: Tiêu đề, mô tả, vị trí, phân loại danh mục và hình ảnh
.
Giai đoạn 3: Phát triển hệ thống So khớp và Yêu cầu nhận đồ (Matching & Claiming)
So khớp tự động: Tích hợp Supabase Edge Functions để chạy ngầm kịch bản tự động đối chiếu các bài đăng "Mất đồ" với "Nhặt được đồ" ngay khi có bài đăng mới và gửi thông báo nếu trùng khớp
.
Gửi Yêu cầu nhận đồ (Claim): Cho phép người mất đồ nhấn nút "Đây là đồ của tôi" tại bài đăng Found. Yêu cầu họ bắt buộc phải tải lên bằng chứng sở hữu (ảnh chụp cũ hoặc mô tả đặc điểm nhận dạng ẩn như vết xước, mật khẩu)
.
Duyệt Yêu cầu (Chấp nhận Claim): Giao diện cho người nhặt xem xét bằng chứng và nhấn "Chấp nhận". Lúc này trạng thái bài đăng sẽ chuyển sang "Pending" (đang chờ nhận đồ)
.
Giai đoạn 4: Xây dựng Cơ chế Bảo mật thông tin và Chat nội bộ (Privacy & Communication)
Bảo mật thông tin liên lạc: Xây dựng cơ chế ẩn hoàn toàn số điện thoại và link Facebook của người dùng
. Hệ thống chỉ gỡ bỏ lớp bảo mật này và hiển thị thông tin khi yêu cầu Claim được "Chấp nhận"
.
Tích hợp Chat nội bộ: Sử dụng Supabase Realtime để xây dựng khung chat. Tính năng này cho phép người nhặt và người mất nhắn tin trao đổi trực tiếp trên web theo thời gian thực để hẹn cách giao nhận đồ
.
Giai đoạn 5: Tích hợp Nghiệp vụ của Bảo vệ/Ban quản lý và Bàn giao đồ
Bàn giao qua Bảo vệ: Xây dựng tính năng cho phép người nhặt đổi trạng thái bài đăng thành "Đã bàn giao" kèm ghi chú địa điểm (ví dụ: gửi tại phòng bảo vệ) nếu họ không muốn tự giữ đồ
.
Bài đăng đại diện: Cấp quyền cho tài khoản Bảo vệ/Ban quản lý tạo các bài đăng FOUND đại diện cho tổ chức (như "Văn phòng Đoàn") khi có sinh viên đến nộp đồ nhặt được
.
Đóng bài đăng: Giao diện cho Bảo vệ cập nhật trạng thái bài đăng thành "Trao trả thành công" sau khi đã đối chiếu bằng chứng thực tế và giao đồ cho sinh viên. Thao tác này sẽ đóng bài đăng hoàn toàn
.
Giai đoạn 6: Xây dựng Hệ thống Hậu kiểm (Moderation) và Thống kê (Reporting) cho Admin
Báo cáo bài đăng (Report): Cho phép người dùng báo cáo các bài đăng có dấu hiệu lừa đảo, spam hoặc nội dung nhạy cảm
.
Xử lý vi phạm: Xây dựng giao diện Admin Dashboard để Admin xem xét các báo cáo, thực hiện Xóa bài đăng vi phạm và Khóa tài khoản của những người dùng lạm dụng/vi phạm nội quy
.
Thống kê và Trích xuất báo cáo: Viết chức năng tự động tổng hợp lịch sử các món đồ đã "Trao trả thành công" theo mốc thời gian (tuần, tháng...) và xuất file báo cáo phục vụ nhà trường
.