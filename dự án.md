0.cơ sở dữ liệu :
-- 2. ENUM TYPES
CREATE TYPE loai_tin AS ENUM ('lost', 'found');
CREATE TYPE trang_thai_bai_dang AS ENUM ('pending', 'delivered', 'success');

-- 3. BẢNG DANH MỤC (danh_muc)
CREATE TABLE danh_muc (
    id_danh_muc UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ten_danh_muc TEXT NOT NULL UNIQUE
);

-- 4. BẢNG NGƯỜI DÙNG (nguoi_dung)
CREATE TABLE nguoi_dung (
    id_nguoi_dung UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE CHECK (email LIKE '%@husc.edu.vn'),
    so_dien_thoai TEXT,
    facebook_link TEXT,
    vai_tro TEXT CHECK (vai_tro IN ('sinh_vien', 'bao_ve', 'admin')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BẢNG BÀI ĐĂNG (bai_dang)
CREATE TABLE bai_dang (
    id_bai_dang UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_nguoi_dang UUID REFERENCES nguoi_dung(id_nguoi_dung) ON DELETE CASCADE,
    id_danh_muc UUID REFERENCES danh_muc(id_danh_muc),
    loai loai_tin NOT NULL,
    tieu_de TEXT NOT NULL,
    mo_ta TEXT,
    vi_tri TEXT NOT NULL,
    hinh_anh TEXT,
    trang_thai trang_thai_bai_dang DEFAULT 'pending',
    is_dai_dien BOOLEAN DEFAULT FALSE,
    ghi_chu_ban_giao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BẢNG YÊU CẦU NHẬN ĐỒ (yeu_cau_nhan_do)
CREATE TABLE yeu_cau_nhan_do (
    id_yeu_cau UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_bai_dang UUID REFERENCES bai_dang(id_bai_dang) ON DELETE CASCADE,
    id_nguoi_gui UUID REFERENCES nguoi_dung(id_nguoi_dung),
    bang_chung_mo_ta TEXT NOT NULL,
    bang_chung_hinh_anh TEXT,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. BẢNG BÁO CÁO (bao_cao)
CREATE TABLE bao_cao (
    id_bao_cao UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_bai_dang UUID REFERENCES bai_dang(id_bai_dang) ON DELETE CASCADE,
    id_nguoi_bao_cao UUID REFERENCES nguoi_dung(id_nguoi_dung),
    ly_do_vi_pham TEXT NOT NULL,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. BẢNG TIN NHẮN (tin_nhan)
CREATE TABLE tin_nhan (
    id_tin_nhan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_bai_dang UUID REFERENCES bai_dang(id_bai_dang),
    id_nguoi_gui UUID REFERENCES nguoi_dung(id_nguoi_dung),
    id_nguoi_nhan UUID REFERENCES nguoi_dung(id_nguoi_dung),
    noi_dung TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHÈN DỮ LIỆU MẪU
INSERT INTO danh_muc (ten_danh_muc) VALUES 
('Điện thoại & Máy tính bảng'),
('Ví & Tiền mặt'),
('Giấy tờ tùy thân'),
('Chìa khóa'),
('Ba lô & Túi xách'),
('Khác');




------------------------------
I.CÁC CÔNG NGHỆ SỬ DỤNG
-sử dụng VITE để dựng front end 
-công nghệ sử dụng để tiện cho bạn viết ý tưởng : về front end tôi sử dụng ngôn ngữ tôi sài js , frame work tôi sài react , thư viện sử dụng tailwind .

-về backend : language tôi sử sụng js( node.js) , database sử dụng postgre( supabase) và API sử dụng REST ,	Cài đặt thư viện: express, cors, dotenv, , @supabase/supabase-js, và bcryptjs.



----------------


Bản mô tả hệ thống : 
II. Đối tượng sử dụng hệ thống Hệ thống Tìm đồ thất lạc HUSC gồm ba đối tượng chính: • Người dùng (Sinh viên/Cán bộ HUSC) 
• Bảo vệ / Ban quản lý (Security Role)
 • Quản trị viên (Admi)
III. Quy trình hoạt động của đối tượng
+ Quy trình và hoạt động của Người dùng (Sinh viên/Cán bộ HUSC)
Bắt đầu tham gia, người dùng truy cập hệ thống và thực hiện đăng nhập bằng email định dạng @husc.edu.vn. Sau khi xác thực thành công, hệ thống chuyển hướng người dùng vào giao diện Dashboard.
Ghi chú kỹ thuật về đồng bộ phân quyền: Vì hệ thống sử dụng nền tảng Backend là Node.js thay vì sử dụng hoàn toàn Supabase Auth, Backend Node.js sẽ cần tạo ra các Custom JWT (JSON Web Tokens) tương thích với chuẩn của Supabase. Điều này đảm bảo để hệ thống Chat nội bộ (Supabase Realtime) và kịch bản so khớp ngầm (Supabase Edge Functions) vẫn có thể nhận diện được người dùng hiện tại là ai và phân quyền chính xác khi họ chat hoặc kích hoạt hàm ẩn.
Tại Dashboard, người dùng có thể Đăng tin (Mất đồ hoặc Nhặt được đồ). Thông tin gốc bao gồm tiêu đề, mô tả, vị trí, phân loại và hình ảnh. Ngay sau đó, Supabase Edge Functions sẽ chạy ngầm kịch bản so khớp và gửi thông báo nếu có bài đăng trùng khớp.
Quy trình Xác minh (Claiming Process) và Bảo mật liên lạc: Khi một sinh viên bị mất đồ tìm thấy bài đăng "Found" phù hợp, họ sẽ thực hiện Gửi yêu cầu nhận đồ (Claim) bằng cách nhấn nút "Đây là đồ của tôi". Để tránh gian lận, hệ thống yêu cầu người mất phải cung cấp Bằng chứng sở hữu (tải lên ảnh chụp trước đó hoặc mô tả các đặc điểm nhận dạng ẩn mà bài đăng công khai không có như vết xước, mật khẩu màn hình).
Người nhặt đồ sẽ nhận được thông báo và xem danh sách các "Claims". Nếu xác nhận đúng chủ nhân, người nhặt nhấn "Chấp nhận" để chuyển trạng thái bài đăng sang "Pending" (đang chờ nhận đồ). Hệ thống áp dụng cơ chế Bảo mật thông tin (Privacy) khắt khe: số điện thoại hay link Facebook cá nhân bị ẩn hoàn toàn, và chỉ hiển thị cho đối phương khi yêu cầu Claim được chấp nhận. Ngoài ra, hệ thống cung cấp một khung Chat nội bộ (tích hợp Supabase Realtime) để hai bên trao đổi trực tiếp trên web mà không cần lộ thông tin cá nhân ra ngoài.
Trong trường hợp người nhặt không muốn giữ đồ bên mình, họ có thể bàn giao món đồ cho phòng bảo vệ và cập nhật trạng thái bài đăng thành "Đã bàn giao" (ví dụ: "Đã gửi tại phòng bảo vệ tầng 1") để người mất chủ động đến nhận.
Ngoài ra, người dùng có quyền Báo cáo bài đăng (Report) đối với các tin đăng có dấu hiệu lừa đảo, spam hoặc chứa nội dung nhạy cảm để gửi lên ban quản trị xử lý.



+ Quy trình và hoạt động của Bảo vệ/Ban quản lý (Security Role) Đây là nhóm đối tượng phụ trách "Kho đồ tập trung" của trường. Khi truy cập và đăng nhập vào hệ thống với vai trò Bảo vệ/BQL, họ có quyền tạo các bài đăng FOUND đại diện cho một tổ chức cố định (ví dụ: "Văn phòng Đoàn" hoặc "Phòng Bảo vệ Nhà A"). Khi sinh viên mang đồ nhặt được đến nộp, Bảo vệ sẽ tiếp nhận, phân loại và đăng thông tin lên hệ thống. Khi có sinh viên đến nhận lại đồ, Bảo vệ sẽ đối chiếu bằng chứng sở hữu và cập nhật trạng thái hoàn tất trên hệ thống để đóng bài đăng.
+ Quy trình và hoạt động của Quản trị viên (Admin) Quản trị viên là người giám sát toàn bộ nền tảng. Sau khi đăng nhập vào Giao diện Quản lý (Admin Dashboard), quản trị viên thực hiện các nghiệp vụ:
  Quản lý tài khoản và Danh mục: Thêm, sửa, xóa danh mục đồ vật và khóa các tài khoản vi phạm.
 Cơ chế hậu kiểm (Reporting): Tiếp nhận và xử lý các "Báo cáo (Report)" từ sinh viên. Quản trị viên sẽ kiểm tra và thực hiện lệnh xóa trực tiếp đối với các bài đăng vi phạm nội quy hoặc lừa đảo.
 Thống kê và Báo cáo lịch sử hoạt động: Hệ thống tự động lưu lại lịch sử các món đồ đã được chuyển trạng thái "Trao trả thành công". Quản trị viên có thể trích xuất dữ liệu này để làm báo cáo thống kê định kỳ cho nhà trường (ví dụ: "Tháng này hệ thống đã giúp tìm lại 50 món đồ cho sinh viên").
Sau khi hoàn tất công việc, Admin, Bảo vệ và Người dùng đều có thể nhấn Đăng xuất để kết thúc phiên làm việc an toàn.





IV. Thiết kế hệ thống
1. Biểu đồ lớp trong hệ thống
 






1. Mô tả các lớp (Classes) trong hệ thống Tìm đồ thất lạc HUSC
a. Nhóm Lớp Người dùng (User)
•	Lớp NguoiDung (Lớp cha đại diện chung):
o	Thuộc tính: Email (định dạng @husc.edu.vn), Thông tin liên hệ (số điện thoại, link Facebook cá nhân - được bảo mật ẩn/hiện tùy ngữ cảnh), Vai trò (Sinh viên/Cán bộ, Bảo vệ/BQL, Quản trị viên).
o	Phương thức: dangNhap(), dangXuat(), chatNoiBo() (sử dụng Supabase Realtime).
•	Hệ thống kế thừa thành 3 lớp con dựa trên vai trò:
o	Lớp NguoiDung_SinhVien (Sinh viên/Cán bộ): Sở hữu các nghiệp vụ chính như dangTin(), guiYeuCauNhanDo() (Claim), và baoCaoBaiDang() (Report).
o	Lớp NguoiDung_BaoVe (Bảo vệ/Ban quản lý): Đại diện cho "kho đồ tập trung", có các nghiệp vụ đặc thù như taoBaiDangDaiDien() (cho phòng ban cố định), doiChieuBangChung(), và capNhatTrangThaiHoanTat().
o	Lớp Admin (Quản trị viên): Có các phương thức quản trị toàn cục như khoaTaiKhoan(), xoaBaiDang(), và trichXuatThongKe().
b. Nhóm Lớp Dữ liệu chính (Core Data)
•	Lớp BaiDang (Bài đăng):
o	Thuộc tính: Loại tin (Mất đồ / Nhặt được đồ), Tiêu đề, Mô tả, Vị trí, Hình ảnh, và Trạng thái (Pending / Đã bàn giao / Trao trả thành công).
o	Phương thức: taoBaiDang(), capNhatTrangThai().
•	Lớp DanhMuc (Danh mục đồ vật):
o	Thuộc tính: Tên danh mục đồ vật (dùng để phân loại bài đăng).
o	Phương thức (dành cho Admin): them(), sua(), xoa().
c. Nhóm Lớp Tương tác và Xác minh
•	Lớp YeuCauNhanDo (Claim):
o	Thuộc tính: Bằng chứng sở hữu (ảnh chụp hoặc mô tả đặc điểm nhận dạng ẩn như vết xước, mật khẩu).
o	Phương thức: guiYeuCau(), chapNhanYeuCau().
•	Lớp BaoCao (Report):
o	Thuộc tính: Dấu hiệu vi phạm (lừa đảo, spam, chứa nội dung nhạy cảm).
o	Phương thức: taoBaoCao(), xuLyBaoCao().
2. Giải thích các mối quan hệ chính (Relationships) trên biểu đồ
•	Quan hệ giữa NguoiDung và BaiDang (1 - n): Một Sinh viên hoặc Bảo vệ có thể tạo 0 đến n Bài đăng (Tìm đồ hoặc Trả đồ).
•	Quan hệ giữa BaiDang và DanhMuc (n - 1): Một Danh mục có thể chứa nhiều Bài đăng, nhưng mỗi Bài đăng khi được tạo phải thuộc về một Phân loại danh mục cụ thể.
•	Quan hệ giữa BaiDang và YeuCauNhanDo (1 - n): Khi một Bài đăng "Found" (Nhặt được đồ) được tạo ra, nó có thể nhận được một danh sách gồm nhiều Yêu cầu nhận đồ (Claims) từ các sinh viên bị mất đồ khác nhau.
•	Quan hệ giữa NguoiDung và YeuCauNhanDo (1 - n): Một người bị mất đồ có thể gửi nhiều Yêu cầu nhận đồ kèm Bằng chứng sở hữu cho các bài đăng phù hợp.
•	Quan hệ Phụ thuộc với Hệ thống ngoài (Supabase):
o	Hệ thống sử dụng các tiến trình ngầm từ Supabase Edge Functions để chạy kịch bản so khớp bài đăng tự động.
o	Lớp khung Chat nội bộ phụ thuộc vào Supabase Realtime để hai bên trao đổi










2. Mô hình use case
a. Danh sách actor và use case Dựa vào luồng hoạt động thực tế của dự án Tìm đồ thất lạc HUSC, hệ thống có ba tác nhân chính (Actor) và một số Use case con (Sub use cases) được hệ thống gọi ngầm.
Use case con (Sub use cases)
•	UC_Sub1: So khớp bài đăng tự động (Hệ thống gọi Supabase Edge Functions để tìm trùng khớp và thông báo).
•	UC_Sub2: Bảo mật thông tin liên lạc (Hệ thống ẩn số điện thoại/Facebook và chỉ hiển thị khi Claim được duyệt).
•	UC_Sub3: Đồng bộ phân quyền (Hệ thống tự động tạo Custom JWT để nhận diện người dùng trên Supabase).
Nhóm Use case Chung (Mọi đối tượng)
•	UC_1: Đăng nhập hệ thống (bằng email @husc.edu.vn).
•	UC_2: Đăng xuất.
Actor 1: Người dùng (Sinh viên/Cán bộ HUSC)
•	UC_3: Đăng tin (Mất đồ hoặc Nhặt được đồ).
•	UC_4: Gửi yêu cầu nhận đồ - Claim (Kèm bằng chứng sở hữu).
•	UC_5: Quản lý yêu cầu nhận đồ (Xem danh sách Claims và Chấp nhận).
•	UC_6: Cập nhật trạng thái bài đăng (Chuyển thành "Đã bàn giao").
•	UC_7: Chat nội bộ.
•	UC_8: Báo cáo bài đăng (Report).
Actor 2: Bảo vệ / Ban quản lý (Security Role)
•	UC_9: Tạo bài đăng FOUND đại diện.
•	UC_10: Đối chiếu bằng chứng và cập nhật trạng thái hoàn tất.
Actor 3: Quản trị viên (Admin)
•	UC_11: Quản lý danh mục đồ vật (Thêm, sửa, xóa).
•	UC_12: Khóa tài khoản vi phạm.
•	UC_13: Xử lý báo cáo và Xóa bài đăng vi phạm.
•	UC_14: Thống kê và trích xuất báo cáo.

b. Danh sách các Usecase
CÁC USECASE CON (SUB USECASE)



UC_Sub1: So khớp bài đăng tự động
•	Mô tả ngắn gọn: Hệ thống chạy ngầm kịch bản so khớp thông qua Supabase Edge Functions ngay sau khi có bài đăng mới được tạo, nhằm tìm ra những thông tin đồ vật trùng khớp và tự động gửi thông báo cho người dùng.
•	Tác nhân chính: Hệ thống (Supabase Edge Functions).
•	Tác nhân thứ cấp: Không có.
•	Tiền điều kiện: Người dùng vừa đăng thành công một bài đăng mới (Mất đồ hoặc Nhặt được đồ) và thông tin gốc (tiêu đề, mô tả, vị trí, phân loại, hình ảnh) đã được lưu vào hệ thống.
•	Hậu điều kiện: Quá trình so khớp hoàn tất. Nếu tìm thấy dữ liệu trùng khớp, hệ thống sẽ gửi thông báo đến người dùng.
•	Kịch bản chính:
1.	Hệ thống tiếp nhận bài đăng mới từ người dùng.
2.	Supabase Edge Functions được kích hoạt và tiến hành chạy ngầm kịch bản so khớp.
3.	Hệ thống đối chiếu dữ liệu của bài đăng mới với các dữ liệu hiện có trong cơ sở dữ liệu (ví dụ: đối chiếu tin mất đồ với tin nhặt được đồ).
4.	Nếu phát hiện có thông tin đồ vật trùng khớp, hệ thống tự động tạo và gửi thông báo đến tài khoản của người dùng tương ứng. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Không có bài đăng trùng khớp: Quá trình so khớp ngầm kết thúc mà không tìm thấy dữ liệu phù hợp, hệ thống không gửi bất kỳ thông báo nào.
UC_Sub2: Bảo mật thông tin liên lạc
•	Mô tả ngắn gọn: Hệ thống áp dụng cơ chế bảo mật (Privacy) khắt khe nhằm bảo vệ thông tin cá nhân của người dùng. Số điện thoại và link Facebook cá nhân sẽ bị ẩn hoàn toàn và chỉ hiển thị ra cho đối phương khi yêu cầu nhận đồ (Claim) được chấp nhận.
•	Tác nhân chính: Hệ thống.
•	Tác nhân thứ cấp: Không có.
•	Tiền điều kiện: Có một yêu cầu Claim vừa được người nhặt đồ nhấn "Chấp nhận". Thông tin liên lạc giữa hai bên (người mất và người nhặt) đang bị ẩn.
•	Hậu điều kiện: Hệ thống mở khóa thông tin liên hệ và hiển thị khung chat nội bộ cho cả hai bên.
•	Kịch bản chính:
1.	Hệ thống nhận được xác nhận chuyển trạng thái bài đăng sang "Pending" sau khi người nhặt nhấn "Chấp nhận".
2.	Hệ thống gỡ bỏ lớp bảo mật ẩn thông tin, cấp quyền hiển thị số điện thoại và link Facebook cá nhân của hai bên cho nhau.
3.	Hệ thống đồng thời kích hoạt hiển thị khung Chat nội bộ (được tích hợp qua Supabase Realtime) để hai người dùng có thể trao đổi trực tiếp trên nền tảng web mà không sợ lộ thông tin ra bên ngoài. Kết thúc use case.
UC_Sub3: Đồng bộ phân quyền
•	Mô tả ngắn gọn: Do hệ thống dùng nền tảng Backend Node.js thay vì hoàn toàn dùng Supabase Auth, hệ thống tự động khởi tạo Custom JWT (JSON Web Tokens) để nhận diện người dùng và cấp quyền chính xác khi họ giao tiếp qua khung chat hoặc chạy các kịch bản ngầm.
•	Tác nhân chính: Hệ thống (Backend Node.js).
•	Tác nhân thứ cấp: Supabase (Realtime / Edge Functions).
•	Tiền điều kiện: Người dùng (Sinh viên, Bảo vệ, Admin) vừa thực hiện xác thực đăng nhập thành công vào hệ thống bằng email @husc.edu.vn.
•	Hậu điều kiện: Một Custom JWT tương thích chuẩn Supabase được tạo thành công, đảm bảo hệ thống nhận diện đúng vai trò của phiên làm việc đó.
•	Kịch bản chính:
1.	Sau khi người dùng đăng nhập hợp lệ, Backend Node.js tiếp nhận thông tin người dùng.
2.	Backend tiến hành tạo ra các Custom JWT chứa định danh và vai trò tương ứng, đảm bảo tương thích với chuẩn của Supabase.
3.	Hệ thống gắn Custom JWT này vào phiên đăng nhập của người dùng.
4.	Nhờ token này, khi người dùng sử dụng hệ thống Chat nội bộ (Supabase Realtime) hoặc khi gọi kịch bản so khớp ngầm (Supabase Edge Functions), hệ thống luôn nhận diện được người dùng hiện tại là ai và cho phép phân quyền chính xác. Kết thúc use case.
NHÓM USE CASE CHUNG
UC_1: Đăng nhập hệ thống
•	Mô tả ngắn gọn: Tất cả người dùng bắt đầu tham gia hệ thống bằng cách thực hiện đăng nhập thông qua tài khoản email của trường. Việc đăng nhập thành công sẽ giúp hệ thống xác định danh tính và cấp quyền truy cập tương ứng với vai trò của họ.
•	Tác nhân chính: Người dùng (Mọi đối tượng bao gồm Sinh viên/Cán bộ, Bảo vệ/BQL, Admin).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Người dùng truy cập vào trang đăng nhập và sở hữu tài khoản email hợp lệ có đuôi của trường.
•	Hậu điều kiện: Phiên làm việc được khởi tạo an toàn, người dùng được nhận diện đúng vai trò và chuyển hướng vào giao diện Dashboard.
•	Kịch bản chính:
1.	Người dùng truy cập vào giao diện trang đăng nhập của hệ thống Tìm đồ thất lạc HUSC.
2.	Người dùng tiến hành đăng nhập bằng email với định dạng bắt buộc là @husc.edu.vn.
3.	Hệ thống tiếp nhận và xác thực thông tin đăng nhập.
4.	<> UC_Sub3: Đồng bộ phân quyền. Do hệ thống sử dụng Backend Node.js, ngay sau khi xác thực thành công, Backend sẽ tạo ra các Custom JWT (JSON Web Tokens) tương thích với chuẩn của Supabase. Điều này đảm bảo hệ thống nhận diện được người dùng cho các tính năng Chat nội bộ (Supabase Realtime) và Hàm ngầm (Supabase Edge Functions).
5.	Hệ thống xác định vai trò của tài khoản (Sinh viên/Cán bộ, Bảo vệ/BQL hay Admin).
6.	Hệ thống cấp quyền và chuyển hướng người dùng vào giao diện Dashboard tương ứng với vai trò đó. Kết thúc use case.
•	Kịch bản phụ:
o	2a. Sai định dạng email: Người dùng sử dụng email cá nhân (ví dụ: @gmail.com) thay vì email trường. Hệ thống sẽ chặn luồng đăng nhập, báo lỗi định dạng không hợp lệ và yêu cầu sử dụng tài khoản email @husc.edu.vn.
o	3a. Xác thực thất bại: Thông tin đăng nhập không hợp lệ, hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại.
UC_2: Đăng xuất
•	Mô tả ngắn gọn: Người dùng kết thúc phiên làm việc hiện tại và đăng xuất khỏi hệ thống để đảm bảo an toàn cho dữ liệu cá nhân.
•	Tác nhân chính: Người dùng (Mọi đối tượng).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Người dùng đang trong một phiên đăng nhập hợp lệ trên hệ thống.
•	Hậu điều kiện: Phiên đăng nhập bị hủy bỏ hoàn toàn, thông tin xác thực bị xóa khỏi bộ nhớ và người dùng được đưa trở lại trang Đăng nhập.
•	Kịch bản chính:
1.	Từ giao diện làm việc (Dashboard), người dùng (Admin, Bảo vệ, hoặc Sinh viên) nhấn vào nút chức năng Đăng xuất.
2.	Hệ thống tiếp nhận yêu cầu, tiến hành hủy bỏ phiên làm việc và xóa các Custom JWT hoặc token định danh khỏi bộ nhớ đệm.
3.	Hệ thống đặt lại trạng thái và tự động chuyển hướng người dùng quay trở về trang Đăng nhập ban đầu. Kết thúc use case.
USE CASE CỦA NGƯỜI DÙNG (SINH VIÊN/CÁN BỘ HUSC)

UC_3: Đăng tin mất đồ
Mô tả ngắn gọn: Người dùng tạo một bài đăng thông báo về việc mình bị thất lạc đồ đạc (LOST) trên hệ thống, cung cấp các thông tin chi tiết để nhờ cộng đồng sinh viên và cán bộ HUSC hỗ trợ tìm kiếm.
Tác nhân chính: Người dùng (Sinh viên/Cán bộ bị mất đồ).
Tác nhân thứ cấp: Hệ thống.
Tiền điều kiện: Người dùng đã đăng nhập thành công vào hệ thống bằng email @husc.edu.vn và đang ở giao diện Dashboard.
Hậu điều kiện: Thông tin bài đăng mất đồ được khởi tạo thành công, lưu vào cơ sở dữ liệu, hiển thị công khai trên hệ thống và tiến trình so khớp ngầm tự động được kích hoạt.
Kịch bản chính:
1.	Từ giao diện Dashboard, người dùng chọn chức năng "Đăng tin" và lựa chọn loại tin là "Mất đồ".
2.	Người dùng nhập các thông tin gốc bắt buộc của món đồ bao gồm: tiêu đề, mô tả, vị trí, phân loại danh mục và tải lên hình ảnh.
3.	Người dùng nhấn nút xác nhận tạo bài đăng.
4.	Hệ thống tiếp nhận dữ liệu và lưu thông tin bài đăng vào cơ sở dữ liệu.
5.	<> UC_Sub1: So khớp bài đăng tự động. Ngay sau khi lưu, hệ thống tự động gọi Supabase Edge Functions để chạy ngầm kịch bản so khớp nhằm đối chiếu bài đăng mất đồ này với các bài đăng nhặt được đồ hiện có.
6.	Hệ thống cập nhật giao diện, hiển thị bài đăng mất đồ mới lên bảng tin chung. Kết thúc use case.
Kịch bản phụ:
•	2a. Nhập thiếu thông tin: Người dùng để trống các trường bắt buộc (ví dụ: thiếu tiêu đề, mô tả hoặc chưa chọn phân loại). Hệ thống sẽ chặn thao tác đăng bài, hiển thị cảnh báo lỗi và yêu cầu điền đầy đủ thông tin.



UC_4: Đăng tin nhặt được đồ
•	Mô tả ngắn gọn: Người dùng khi nhặt được một món đồ thất lạc sẽ tạo bài đăng thông báo (FOUND) trên hệ thống để tìm và trả lại cho chủ nhân thực sự của món đồ đó.
•	Tác nhân chính: Người dùng (Sinh viên/Cán bộ nhặt được đồ).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Người dùng đã đăng nhập thành công vào hệ thống bằng email định dạng @husc.edu.vn và đang ở giao diện Dashboard.
•	Hậu điều kiện: Bài đăng nhặt được đồ được lưu vào cơ sở dữ liệu, hiển thị công khai trên hệ thống, tiến trình so khớp ngầm tự động được kích hoạt và sẵn sàng nhận yêu cầu Claim (Yêu cầu nhận đồ) từ những người bị mất đồ.
•	Kịch bản chính:
1.	Từ giao diện Dashboard, người dùng chọn chức năng "Đăng tin" và lựa chọn loại tin là "Nhặt được đồ".
2.	Người dùng nhập các thông tin gốc của món đồ nhặt được bao gồm: tiêu đề, mô tả, vị trí, phân loại và hình ảnh. (Lưu ý: Khuyến khích người đăng chỉ mô tả chung và giữ lại một số đặc điểm nhận dạng ẩn để làm cơ sở đối chiếu khi có người Claim).
3.	Người dùng nhấn nút xác nhận tạo bài đăng.
4.	Hệ thống tiếp nhận dữ liệu và lưu thông tin bài đăng "Found" vào cơ sở dữ liệu.
5.	<> UC_Sub1: So khớp bài đăng tự động. Ngay lập tức, hệ thống tự động gọi Supabase Edge Functions để chạy ngầm kịch bản so khớp nhằm đối chiếu bài đăng nhặt được đồ này với các bài đăng mất đồ (LOST) hiện có trên hệ thống.
6.	Hệ thống cập nhật giao diện, hiển thị bài đăng lên bảng tin chung để người bị mất đồ có thể vào xem và gửi yêu cầu nhận lại đồ. Kết thúc use case.
•	Kịch bản phụ:
o	2a. Nhập thiếu thông tin: Người dùng để trống các trường dữ liệu bắt buộc (như tiêu đề, mô tả, phân loại). Hệ thống sẽ ngăn chặn thao tác đăng bài, hiển thị cảnh báo đỏ và yêu cầu người dùng điền đầy đủ các thông tin hợp lệ.
UC_5: Gửi yêu cầu nhận đồ (Claim)
•	Mô tả ngắn gọn: Quy trình xác minh xảy ra khi một sinh viên bị mất đồ tìm thấy bài đăng "Nhặt được đồ" (Found) phù hợp. Họ sẽ gửi yêu cầu nhận lại đồ kèm theo bằng chứng sở hữu để chứng minh quyền sở hữu của mình đối với món đồ đó.
•	Tác nhân chính: Người dùng (Sinh viên/Cán bộ bị mất đồ).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Người dùng đã đăng nhập thành công vào hệ thống và đang xem một bài đăng "Nhặt được đồ" (Found) mà họ cho là món đồ mình đã đánh mất.
•	Hậu điều kiện: Yêu cầu nhận đồ (Claim) cùng với bằng chứng sở hữu được lưu vào cơ sở dữ liệu và hệ thống gửi thông báo đến người đăng tin (người nhặt) để chờ phê duyệt.
•	Kịch bản chính:
1.	Người dùng truy cập và xem chi tiết một bài đăng "Nhặt được đồ" phù hợp trên hệ thống.
2.	Người dùng thực hiện gửi yêu cầu bằng cách nhấn vào nút "Đây là đồ của tôi".
3.	Hệ thống hiển thị form yêu cầu cung cấp Bằng chứng sở hữu nhằm xác minh và tránh tình trạng gian lận.
4.	Người dùng tiến hành cung cấp bằng chứng bằng cách tải lên hình ảnh chụp món đồ từ trước, hoặc điền mô tả chi tiết các đặc điểm nhận dạng ẩn mà bài đăng công khai không có (ví dụ: vết xước chuyên biệt, mật khẩu màn hình điện thoại).
5.	Người dùng nhấn nút xác nhận Gửi yêu cầu.
6.	Hệ thống tiếp nhận và lưu thông tin yêu cầu (Claim) vào cơ sở dữ liệu, liên kết trực tiếp với bài đăng "Found" đó.
7.	Hệ thống tự động tạo và gửi thông báo đến tài khoản của người nhặt được đồ để họ vào xem xét. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Thiếu bằng chứng sở hữu: Người dùng cố tình gửi yêu cầu nhưng không tải lên hình ảnh cũng như không nhập bất kỳ mô tả đặc điểm nhận dạng nào. Hệ thống sẽ chặn luồng thực thi, hiển thị cảnh báo đỏ và yêu cầu người dùng bắt buộc phải cung cấp bằng chứng sở hữu để làm cơ sở đối chiếu trước khi cho phép gửi đi.


UC_6: Quản lý yêu cầu nhận đồ (Chấp nhận Claim)
•	Mô tả ngắn gọn: Người nhặt được đồ sau khi nhận được thông báo có người nhận đồ, sẽ tiến hành xem xét danh sách các yêu cầu (Claims), đối chiếu bằng chứng sở hữu và nhấn "Chấp nhận" cho người có bằng chứng đúng nhất. Khi đó, hệ thống sẽ gỡ bỏ cơ chế ẩn danh và kích hoạt khung chat để hai bên trao đổi.
•	Tác nhân chính: Người dùng (Người nhặt được đồ).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Người dùng đang sở hữu một bài đăng "Nhặt được đồ" (Found) trên hệ thống và có ít nhất một người dùng khác đã gửi yêu cầu nhận đồ (Claim) vào bài đăng này.
•	Hậu điều kiện: Trạng thái bài đăng được cập nhật thành "Pending" (đang chờ nhận đồ). Hệ thống gỡ bỏ lớp bảo mật thông tin liên lạc và cung cấp khung Chat nội bộ để hai bên trao đổi.
•	Kịch bản chính:
1.	Hệ thống gửi thông báo đến người nhặt đồ. Người dùng nhấn vào thông báo và xem danh sách các "Claims" đang chờ duyệt.
2.	Người dùng xem xét và đối chiếu các bằng chứng sở hữu do những người gửi yêu cầu cung cấp (ảnh chụp từ trước hoặc mô tả các đặc điểm nhận dạng ẩn của món đồ).
3.	Khi xác định được đúng bằng chứng của chủ nhân thực sự, người nhặt đồ nhấn nút "Chấp nhận" yêu cầu đó.
4.	Hệ thống tiếp nhận thao tác và cập nhật trạng thái bài đăng sang "Pending" (đang chờ nhận đồ).
5.	<> UC_Sub2: Bảo mật thông tin liên lạc. Hệ thống lập tức gỡ bỏ lớp bảo mật quyền riêng tư (Privacy) trước đó, mở khóa để hiển thị số điện thoại và link Facebook cá nhân của hai bên cho nhau.
6.	Hệ thống đồng thời kích hoạt và cung cấp một khung Chat nội bộ (được tích hợp thông qua Supabase Realtime) để hai người có thể trao đổi trực tiếp trên nền tảng web về cách giao nhận đồ mà không cần lộ thông tin cá nhân ra ngoài. Kết thúc use case.
•	Kịch bản phụ:
o	2a. Bằng chứng không thuyết phục: Trong quá trình đối chiếu, nếu người nhặt thấy bằng chứng được cung cấp (vết xước, mật khẩu...) không khớp với tình trạng thực tế của món đồ, họ có thể bỏ qua hoặc từ chối yêu cầu Claim đó để tiếp tục chờ đợi chủ nhân thực sự cung cấp bằng chứng chính xác hơn.

UC_7: Cập nhật trạng thái bài đăng (Chuyển thành "Đã bàn giao")
•	Mô tả ngắn gọn: Trong trường hợp người nhặt được đồ không muốn tự giữ món đồ bên mình để chờ chủ nhân đến nhận, họ có thể đem bàn giao món đồ đó cho phòng bảo vệ. Sau đó, họ thực hiện cập nhật trạng thái bài đăng thành "Đã bàn giao" kèm theo ghi chú địa điểm để người mất đồ có thể chủ động đến nhận lại.
•	Tác nhân chính: Người dùng (Người nhặt được đồ).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Người dùng đã đăng nhập thành công và đang quản lý một bài đăng "Nhặt được đồ" (FOUND) do chính họ tạo trên hệ thống.
•	Hậu điều kiện: Trạng thái của bài đăng được thay đổi thành "Đã bàn giao", thông tin ghi chú về địa điểm gửi đồ được lưu trữ và hiển thị công khai trên hệ thống.
•	Kịch bản chính:
1.	Người dùng mang món đồ nhặt được đến nộp/bàn giao tại phòng bảo vệ hoặc ban quản lý của trường.
2.	Người dùng truy cập vào hệ thống, mở chi tiết bài đăng "Nhặt được đồ" của mình.
3.	Người dùng chọn chức năng cập nhật trạng thái bài đăng và chuyển sang trạng thái "Đã bàn giao".
4.	Hệ thống yêu cầu người dùng nhập thêm thông tin chi tiết về vị trí đã bàn giao (ví dụ: "Đã gửi tại phòng bảo vệ tầng 1").
5.	Người dùng nhấn nút xác nhận cập nhật.
6.	Hệ thống tiếp nhận thông tin, lưu trạng thái mới vào cơ sở dữ liệu và hiển thị công khai sự thay đổi này lên bài đăng để người mất đồ có thể đọc được. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Bỏ trống vị trí bàn giao: Nếu người dùng thay đổi trạng thái sang "Đã bàn giao" nhưng không nhập địa điểm hoặc ghi chú nơi gửi đồ, hệ thống sẽ chặn thao tác cập nhật, hiển thị cảnh báo đỏ và yêu cầu người dùng bắt buộc phải điền thông tin vị trí đã gửi đồ để người mất có cơ sở tìm đến nhận.
UC_8: Chat nội bộ
•	Mô tả ngắn gọn: Hai người dùng (người bị mất đồ và người nhặt được đồ) sử dụng khung chat nội bộ tích hợp công nghệ Supabase Realtime để trao đổi trực tiếp trên nền tảng web về cách thức giao nhận lại đồ vật. Tính năng này giúp hai bên dễ dàng liên lạc mà không cần phải lộ thông tin cá nhân (số điện thoại, Facebook) ra ngoài nếu không muốn.
•	Tác nhân chính: Người dùng (Cả 2 bên: Người mất đồ và Người nhặt đồ).
•	Tác nhân thứ cấp: Hệ thống (Supabase Realtime).
•	Tiền điều kiện: Yêu cầu nhận đồ (Claim) đã được người nhặt nhấn "Chấp nhận" thành công, hệ thống đã gỡ bỏ lớp bảo mật ẩn danh ban đầu và cho phép hai người dùng này kết nối với nhau.
•	Hậu điều kiện: Tin nhắn được gửi đi, đồng bộ và hiển thị tức thời (real-time) trên màn hình của đối phương. Dữ liệu lịch sử chat được lưu lại trong cơ sở dữ liệu.
•	Kịch bản chính:
1.	Người dùng (một trong hai bên) truy cập vào hệ thống và mở giao diện khung Chat nội bộ.
2.	Người dùng nhập nội dung tin nhắn cần trao đổi (ví dụ: thảo luận về thời gian, địa điểm gặp mặt) và nhấn gửi.
3.	Hệ thống kích hoạt phương thức chatNoiBo() và gọi đến máy chủ Supabase Realtime để truyền tải dữ liệu tin nhắn.
4.	Dữ liệu tin nhắn được gửi đi và hiển thị tức thời trên khung chat của đối phương theo thời gian thực.
5.	Hai bên tiếp tục quá trình trao đổi qua lại cho đến khi thống nhất được phương án giao nhận đồ đạc. Kết thúc use case.
•	Kịch bản phụ:
o	3a. Lỗi gián đoạn kết nối: Nếu trong quá trình nhắn tin mà hệ thống mạng của một trong hai bên bị mất kết nối, dịch vụ Supabase Realtime sẽ không thể đồng bộ ngay lập tức. Hệ thống có thể hiển thị cảnh báo tin nhắn chưa được gửi đi và chờ tới khi kết nối mạng được khôi phục để tự động gửi lại.
UC_9: Báo cáo bài đăng (Report)
•	Mô tả ngắn gọn: Khi tham gia hệ thống, nếu người dùng phát hiện các bài đăng có dấu hiệu lừa đảo, spam hoặc chứa nội dung nhạy cảm, họ có quyền gửi báo cáo (Report) về bài đăng đó để ban quản trị (Admin) tiến hành hậu kiểm và xử lý.
•	Tác nhân chính: Người dùng (Sinh viên/Cán bộ HUSC).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Người dùng đã đăng nhập vào hệ thống và đang xem chi tiết một bài đăng (Mất đồ hoặc Nhặt được đồ) mà họ nghi ngờ có sự vi phạm nội quy.
•	Hậu điều kiện: Báo cáo được hệ thống ghi nhận thành công, dữ liệu bài đăng bị đánh dấu (gắn cờ/reported) và chuyển vào danh sách chờ xử lý ở Giao diện Quản lý (Admin Dashboard).
•	Kịch bản chính:
1.	Tại giao diện chi tiết của bài đăng nghi ngờ vi phạm, người dùng nhấn chọn chức năng "Báo cáo bài đăng".
2.	Hệ thống hiển thị một form/hộp thoại yêu cầu người dùng cung cấp lý do báo cáo.
3.	Người dùng chọn hoặc nhập trực tiếp lý do (ví dụ: bài đăng lừa đảo, tin rác/spam, hình ảnh nhạy cảm...).
4.	Người dùng nhấn nút xác nhận "Gửi báo cáo".
5.	Hệ thống tiếp nhận thông tin, lưu dữ liệu báo cáo vào cơ sở dữ liệu và chuyển bài đăng này vào danh sách hậu kiểm của Quản trị viên.
6.	Hệ thống đóng hộp thoại, hiển thị thông báo "Gửi báo cáo thành công" cho người dùng. Kết thúc use case.
•	Kịch bản phụ:
o	3a. Bỏ trống lý do báo cáo: Nếu người dùng nhấn gửi mà không chọn hoặc không nhập bất kỳ lý do nào, hệ thống sẽ ngăn chặn thao tác, hiển thị cảnh báo đỏ và yêu cầu người dùng bắt buộc phải cung cấp lý do vi phạm để làm cơ sở cho Admin xử lý sau này.
NHÓM USE CASE CỦA BẢO VỆ / BAN QUẢN LÝ

UC_10: Tạo bài đăng FOUND đại diện
•	Mô tả ngắn gọn: Nhóm Bảo vệ/Ban quản lý đóng vai trò là "Kho đồ tập trung" của trường. Khi có sinh viên nhặt được đồ nhưng không muốn tự giữ mà đem nộp lại, Bảo vệ sẽ tiếp nhận và sử dụng quyền đặc thù để tạo các bài đăng thông báo (FOUND) lên hệ thống dưới danh nghĩa của một tổ chức/phòng ban cố định (ví dụ: "Phòng Bảo vệ Nhà A" hoặc "Văn phòng Đoàn").
•	Tác nhân chính: Bảo vệ / Ban quản lý (Security Role).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Người dùng đã đăng nhập thành công vào hệ thống và được phân quyền thuộc vai trò Bảo vệ/BQL. Có một món đồ thất lạc vừa được sinh viên mang đến nộp.
•	Hậu điều kiện: Bài đăng FOUND mang nhãn đại diện phòng ban được khởi tạo và lưu vào cơ sở dữ liệu thành công, hiển thị công khai trên bảng tin để những sinh viên bị mất đồ dễ dàng tiếp cận.
•	Kịch bản chính:
1.	Sinh viên mang đồ nhặt được đến nộp trực tiếp tại phòng Bảo vệ/BQL.
2.	Bảo vệ tiến hành tiếp nhận và phân loại món đồ vật đó.
3.	Bảo vệ truy cập vào giao diện hệ thống và gọi phương thức taoBaiDangDaiDien(), chọn chức năng tạo bài đăng FOUND cho tổ chức của mình.
4.	Hệ thống tự động gán nhãn danh tính bài đăng này thuộc về một "tổ chức cố định" thay vì cá nhân thông thường.
5.	Bảo vệ nhập thông tin thông báo lên hệ thống (bao gồm tiêu đề, mô tả nhận dạng chung, vị trí lưu giữ đồ hiện tại tại phòng bảo vệ, hình ảnh và phân loại danh mục).
6.	Bảo vệ nhấn nút xác nhận đăng bài.
7.	Hệ thống tiếp nhận, lưu dữ liệu và hiển thị bài đăng lên bảng tin chung. Kết thúc use case.
•	Kịch bản phụ:
o	5a. Bỏ sót thông tin quan trọng: Nếu Bảo vệ vô tình để trống phân loại đồ vật hoặc thiếu thông tin nơi lưu giữ, hệ thống sẽ tạm thời chặn thao tác đăng bài, hiển thị cảnh báo đỏ và yêu cầu bổ sung thông tin để người mất đồ có cơ sở tìm đến nhận.
UC_11: Đối chiếu bằng chứng sở hữu
•	Mô tả ngắn gọn: Khi có sinh viên đến trực tiếp "kho đồ tập trung" (phòng bảo vệ/ban quản lý) để xin nhận lại món đồ thất lạc, Bảo vệ sẽ tiến hành kiểm tra và đối chiếu các bằng chứng sở hữu do sinh viên cung cấp với tình trạng thực tế của món đồ nhằm đảm bảo trao trả đúng người.
•	Tác nhân chính: Bảo vệ / Ban quản lý (Security Role).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Có một bài đăng "FOUND" đại diện (do phòng bảo vệ quản lý) đang tồn tại trên hệ thống và có sinh viên đến trực tiếp để yêu cầu nhận lại đồ.
•	Hậu điều kiện: Bằng chứng được xác minh tính hợp lệ thành công, làm cơ sở để bảo vệ tiến hành bàn giao lại món đồ cho đúng chủ nhân thực sự.
•	Kịch bản chính:
1.	Sinh viên đến trực tiếp phòng Bảo vệ/BQL và thông báo muốn nhận lại món đồ đã được đăng tải trên hệ thống.
2.	Bảo vệ yêu cầu sinh viên cung cấp các bằng chứng sở hữu cụ thể. Để tránh gian lận, sinh viên phải đưa ra các hình ảnh chụp từ trước hoặc mô tả các đặc điểm nhận dạng ẩn mà bài đăng công khai không có (ví dụ: vết xước chuyên biệt, mật khẩu màn hình thiết bị).
3.	Bảo vệ lấy món đồ tương ứng ra từ kho lưu trữ.
4.	Bảo vệ truy cập hệ thống (nếu cần xem lại thông tin) và tiến hành nghiệp vụ doiChieuBangChung() để kiểm tra thực tế bằng chứng sinh viên đưa ra có khớp với món đồ hay không.
5.	Nếu bằng chứng hoàn toàn trùng khớp (ví dụ: mở khóa điện thoại thành công, đúng vết xước), bảo vệ xác nhận đúng chủ nhân và tiến hành bàn giao đồ. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Bằng chứng không trùng khớp hoặc có dấu hiệu gian lận: Trong quá trình đối chiếu, nếu sinh viên mô tả sai các đặc điểm ẩn hoặc không thể mở khóa thiết bị, Bảo vệ sẽ từ chối yêu cầu bàn giao đồ để đảm bảo an toàn tài sản và yêu cầu sinh viên cung cấp bằng chứng khác chính xác hơn.
UC_12: Cập nhật trạng thái hoàn tất (Đóng bài đăng)
•	Mô tả ngắn gọn: Sau khi xác minh bằng chứng trùng khớp và bàn giao món đồ thất lạc lại cho đúng chủ nhân, Bảo vệ/Ban quản lý sẽ thực hiện cập nhật trạng thái bài đăng thành "Trao trả thành công". Việc này giúp hệ thống chính thức khép lại bài đăng và lưu trữ lịch sử để phục vụ công tác báo cáo sau này.
•	Tác nhân chính: Bảo vệ / Ban quản lý (Security Role).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Quá trình đối chiếu bằng chứng sở hữu (UC_11) đã diễn ra thành công và Bảo vệ đã tiến hành bàn giao thực tế món đồ cho sinh viên.
•	Hậu điều kiện: Bài đăng chuyển trạng thái sang "Trao trả thành công" và được đóng lại hoàn toàn. Dữ liệu lịch sử của phiên trao trả được hệ thống ghi nhận để phục vụ việc trích xuất báo cáo thống kê định kỳ.
•	Kịch bản chính:
1.	Sau khi sinh viên nhận lại đồ thành công, Bảo vệ truy cập vào hệ thống và mở chi tiết bài đăng FOUND đại diện tương ứng.
2.	Bảo vệ gọi phương thức capNhatTrangThaiHoanTat() bằng cách chọn tính năng cập nhật trạng thái của bài đăng.
3.	Bảo vệ chọn trạng thái "Trao trả thành công".
4.	Bảo vệ nhấn nút xác nhận hoàn tất thao tác.
5.	Hệ thống tiếp nhận lệnh, cập nhật trạng thái mới vào cơ sở dữ liệu và chính thức "đóng" bài đăng lại (không cho phép gửi thêm yêu cầu Claim mới hay hiển thị ở trạng thái đang tìm kiếm).
6.	Hệ thống tự động lưu lại lịch sử hoàn tất giao dịch của món đồ này để phục vụ cho các nghiệp vụ trích xuất báo cáo thống kê định kỳ cho nhà trường của ban quản trị sau này. Kết thúc use case.
•	Kịch bản phụ:
o	2a. Lỗi kết nối khi cập nhật: Trong lúc bảo vệ nhấn xác nhận hoàn tất, nếu hệ thống gặp sự cố mạng hoặc lỗi máy chủ, hệ thống sẽ hiển thị thông báo lỗi cập nhật và giữ nguyên trạng thái cũ của bài đăng, đồng thời yêu cầu bảo vệ thử lại thao tác khi đường truyền ổn định.

NHÓM USE CASE CỦA QUẢN TRỊ VIÊN (ADMIN)
UC_13: Thêm danh mục đồ vật
•	Mô tả ngắn gọn: Quản trị viên (Admin) tạo thêm các phân loại danh mục mới vào hệ thống (ví dụ: Điện thoại, Ví tiền, Giấy tờ, Chìa khóa...) nhằm cung cấp các tùy chọn để người dùng phân loại rõ ràng các đồ vật khi họ tạo bài đăng mất đồ hoặc nhặt được đồ,.
•	Tác nhân chính: Quản trị viên (Admin).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Quản trị viên đã đăng nhập hợp lệ vào hệ thống và đang thao tác tại Giao diện Quản lý (Admin Dashboard).
•	Hậu điều kiện: Dữ liệu về danh mục đồ vật mới được lưu thành công vào cơ sở dữ liệu và ngay lập tức khả dụng trên giao diện Đăng tin để người dùng có thể lựa chọn.
•	Kịch bản chính:
1.	Tại Admin Dashboard, Quản trị viên truy cập vào mục "Quản lý danh mục".
2.	Quản trị viên nhấn chọn chức năng Thêm danh mục.
3.	Hệ thống hiển thị một biểu mẫu/hộp thoại yêu cầu cung cấp thông tin.
4.	Quản trị viên nhập "Tên danh mục đồ vật" mới vào ô trống.
5.	Quản trị viên nhấn nút xác nhận thêm.
6.	Hệ thống tiếp nhận dữ liệu và thực thi phương thức them() của đối tượng DanhMuc để lưu thông tin vào cơ sở dữ liệu.
7.	Hệ thống đóng hộp thoại, hiển thị thông báo "Thêm danh mục thành công" và cập nhật danh mục mới này vào danh sách hiển thị trên màn hình quản lý. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Bỏ trống tên danh mục: Nếu Quản trị viên nhấn xác nhận nhưng không nhập tên, hệ thống sẽ ngăn chặn luồng thực thi, hiển thị cảnh báo đỏ và yêu cầu bắt buộc phải điền tên danh mục.
o	4b. Trùng lặp danh mục: Nếu tên danh mục Quản trị viên vừa nhập đã tồn tại trong cơ sở dữ liệu trước đó, hệ thống sẽ báo lỗi "Danh mục này đã tồn tại" và yêu cầu Admin nhập một tên định danh khác.

UC_14: Sửa danh mục đồ vật
•	Mô tả ngắn gọn: Quản trị viên (Admin) tiến hành chỉnh sửa, cập nhật lại tên của một phân loại danh mục đồ vật đã tồn tại trên hệ thống (ví dụ: đổi từ "Giấy tờ" thành "Giấy tờ tùy thân") nhằm giúp việc phân loại bài đăng của người dùng trở nên rõ ràng và tối ưu hơn.
•	Tác nhân chính: Quản trị viên (Admin).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Quản trị viên đã đăng nhập hợp lệ vào hệ thống với vai trò Admin và đang thao tác tại Giao diện Quản lý (Admin Dashboard). Danh mục cần sửa đang tồn tại trong hệ thống.
•	Hậu điều kiện: Thông tin tên danh mục mới được cập nhật thành công vào cơ sở dữ liệu. Toàn bộ giao diện hiển thị danh mục này trên hệ thống (bao gồm cả các form đăng bài) đều được đồng bộ với tên mới.
•	Kịch bản chính:
1.	Tại Admin Dashboard, Quản trị viên truy cập vào mục "Quản lý danh mục".
2.	Quản trị viên tìm kiếm danh mục cần thay đổi và nhấn chọn chức năng Sửa.
3.	Hệ thống hiển thị một biểu mẫu/hộp thoại chứa thông tin tên danh mục hiện tại.
4.	Quản trị viên tiến hành chỉnh sửa và nhập tên danh mục mới vào ô nhập liệu.
5.	Quản trị viên nhấn nút xác nhận cập nhật.
6.	Hệ thống tiếp nhận dữ liệu và thực thi phương thức sua() của đối tượng DanhMuc để tiến hành ghi đè (cập nhật) thông tin vào cơ sở dữ liệu.
7.	Hệ thống đóng hộp thoại, hiển thị thông báo "Cập nhật danh mục thành công" và làm mới lại danh sách hiển thị trên màn hình quản lý. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Bỏ trống tên danh mục: Nếu Quản trị viên xóa tên cũ đi nhưng không nhập tên mới và nhấn xác nhận, hệ thống sẽ ngăn chặn thao tác, hiển thị cảnh báo đỏ yêu cầu bắt buộc phải có tên danh mục.
o	4b. Trùng lặp danh mục: Nếu tên danh mục Quản trị viên vừa chỉnh sửa bị trùng lặp với một tên danh mục khác đã tồn tại trong cơ sở dữ liệu, hệ thống sẽ báo lỗi "Danh mục này đã tồn tại" và yêu cầu Admin chọn một tên khác.
o	5a. Quản trị viên hủy thao tác: Tại hộp thoại sửa, nếu Quản trị viên nhấn nút "Hủy", hệ thống sẽ đóng hộp thoại và bỏ qua mọi thay đổi, giữ nguyên tên danh mục ban đầu.
UC_15: Xóa danh mục đồ vật
•	Mô tả ngắn gọn: Quản trị viên (Admin) thực hiện xóa bỏ một phân loại danh mục đồ vật khỏi hệ thống khi danh mục đó bị dư thừa, nhập sai hoặc không còn cần thiết cho việc phân loại bài đăng.
•	Tác nhân chính: Quản trị viên (Admin).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Quản trị viên đã đăng nhập hợp lệ vào hệ thống với vai trò Admin và đang thao tác tại mục "Quản lý danh mục" thuộc Giao diện Quản lý (Admin Dashboard). Danh mục cần xóa đang tồn tại trong cơ sở dữ liệu.
•	Hậu điều kiện: Dữ liệu về danh mục được chọn bị xóa hoàn toàn khỏi cơ sở dữ liệu và không còn hiển thị trên bất kỳ giao diện nào của hệ thống.
•	Kịch bản chính:
1.	Tại Admin Dashboard, Quản trị viên truy cập vào mục "Quản lý danh mục".
2.	Quản trị viên tìm kiếm danh mục cần loại bỏ và nhấn chọn chức năng Xóa.
3.	Hệ thống hiển thị một hộp thoại cảnh báo để yêu cầu xác nhận việc xóa danh mục.
4.	Quản trị viên nhấn nút "Xác nhận" đồng ý xóa.
5.	Hệ thống tiếp nhận lệnh và thực thi phương thức xoa() của đối tượng DanhMuc để loại bỏ dữ liệu này ra khỏi cơ sở dữ liệu.
6.	Hệ thống đóng hộp thoại, hiển thị thông báo "Xóa danh mục thành công" và tự động làm mới danh sách hiển thị trên màn hình quản lý. Kết thúc use case.
•	Kịch bản phụ:
o	3a. Quản trị viên hủy thao tác: Tại bước hộp thoại cảnh báo, nếu Quản trị viên thay đổi quyết định và nhấn nút "Hủy", hệ thống sẽ lập tức đóng hộp thoại, không thực thi lệnh xóa và giữ nguyên danh mục.
o	4a. Danh mục đang có bài đăng liên kết (Ràng buộc dữ liệu): Trong trường hợp danh mục định xóa đang được gắn cho các bài đăng "Mất đồ" hoặc "Nhặt được đồ" hiện có trên hệ thống, hệ thống sẽ chặn lệnh xóa để bảo vệ toàn vẹn dữ liệu. Hệ thống hiển thị cảnh báo đỏ: "Không thể xóa danh mục đang có bài đăng sử dụng. Vui lòng chuyển bài đăng sang danh mục khác trước khi xóa".
UC_16: Khóa tài khoản vi phạm
•	Mô tả ngắn gọn: Quản trị viên (Admin) thực hiện vai trò giám sát toàn bộ nền tảng và tiến hành khóa các tài khoản người dùng (Sinh viên/Cán bộ) nếu phát hiện họ có hành vi vi phạm nội quy của hệ thống (ví dụ: đăng tin lừa đảo, spam độc hại, báo cáo sai sự thật liên tục).
•	Tác nhân chính: Quản trị viên (Admin).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Quản trị viên đã đăng nhập hợp lệ vào hệ thống và đang thao tác tại Giao diện Quản lý (Admin Dashboard). Tài khoản bị đánh dấu vi phạm đang tồn tại trên hệ thống.
•	Hậu điều kiện: Trạng thái của tài khoản vi phạm được cập nhật thành "Bị khóa" (Locked) trong cơ sở dữ liệu. Người dùng sở hữu tài khoản này sẽ bị vô hiệu hóa quyền truy cập, không thể đăng nhập hay thực hiện thêm bất kỳ chức năng nào trên hệ thống.
•	Kịch bản chính:
1.	Tại Admin Dashboard, Quản trị viên truy cập vào mục Quản lý tài khoản người dùng.
2.	Quản trị viên tìm kiếm và xác định tài khoản người dùng có hành vi vi phạm dựa trên các bằng chứng hoặc báo cáo.
3.	Quản trị viên nhấn chọn chức năng Khóa tài khoản.
4.	Hệ thống hiển thị một hộp thoại yêu cầu xác nhận thao tác khóa tài khoản.
5.	Quản trị viên nhấn nút "Xác nhận" để đồng ý.
6.	Hệ thống tiếp nhận lệnh, kích hoạt phương thức khoaTaiKhoan() của lớp Admin để tiến hành vô hiệu hóa và cập nhật trạng thái của tài khoản này trong cơ sở dữ liệu.
7.	Hệ thống đóng hộp thoại, hiển thị thông báo "Khóa tài khoản thành công" và làm mới lại danh sách hiển thị trên màn hình quản lý. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Quản trị viên hủy thao tác: Tại bước hiển thị hộp thoại cảnh báo, nếu Quản trị viên thay đổi quyết định và nhấn nút "Hủy", hệ thống sẽ đóng hộp thoại, không thực thi lệnh khóa và giữ nguyên trạng thái hoạt động bình thường của tài khoản.
o	2a. Tránh tự khóa tài khoản: Để đảm bảo an toàn vận hành, hệ thống sẽ ẩn chức năng "Khóa" đối với chính tài khoản Admin đang thực hiện phiên đăng nhập hiện tại, ngăn chặn sự cố tự khóa nhầm tài khoản của chính mình.
UC_17: Tiếp nhận và xử lý báo cáo (Report)
•	Mô tả ngắn gọn: Thông qua cơ chế hậu kiểm (Reporting), Quản trị viên (Admin) sẽ tiếp nhận và xử lý các "Báo cáo (Report)" do người dùng (sinh viên/cán bộ) gửi lên. Quản trị viên sẽ tiến hành kiểm tra nội dung bài đăng bị báo cáo để xác minh các dấu hiệu vi phạm nội quy, lừa đảo, spam hoặc nội dung nhạy cảm, từ đó đưa ra quyết định xử lý phù hợp.
•	Tác nhân chính: Quản trị viên (Admin).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Quản trị viên đã đăng nhập hợp lệ vào hệ thống và đang thao tác tại Giao diện Quản lý (Admin Dashboard). Có ít nhất một báo cáo vi phạm vừa được người dùng gửi lên hệ thống.
•	Hậu điều kiện: Báo cáo được hệ thống ghi nhận là "Đã xử lý". Tùy thuộc vào quyết định của Admin, bài đăng vi phạm có thể bị xử lý hoặc được gỡ cờ báo cáo.
•	Kịch bản chính:
1.	Tại Admin Dashboard, Quản trị viên truy cập vào mục Quản lý Báo cáo (Reporting).
2.	Hệ thống truy xuất cơ sở dữ liệu và hiển thị danh sách các bài đăng đang bị đánh dấu báo cáo, kèm theo lý do cụ thể do người dùng cung cấp (ví dụ: lừa đảo, spam, nội dung nhạy cảm).
3.	Quản trị viên nhấn vào xem chi tiết một báo cáo, kiểm tra nội dung bài đăng gốc và đối chiếu các thông tin với nội quy của hệ thống.
4.	Nếu xác định bài đăng thực sự vi phạm nội quy hoặc có dấu hiệu lừa đảo, Quản trị viên quyết định xử lý bài đăng và chuyển tiếp sang lệnh xóa trực tiếp bài đăng đó.
5.	Hệ thống ghi nhận trạng thái của báo cáo này là đã được xử lý xong.
6.	Hệ thống tự động làm mới giao diện và loại bỏ báo cáo vừa giải quyết khỏi danh sách chờ xử lý. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Báo cáo sai sự thật / Không có vi phạm: Trong quá trình hậu kiểm, nếu Quản trị viên nhận thấy bài đăng hoàn toàn bình thường, không vi phạm nội quy (do người dùng báo cáo nhầm hoặc cố tình lạm dụng tính năng report), Quản trị viên sẽ nhấn chọn lệnh "Bỏ qua" hoặc "Từ chối báo cáo". Hệ thống sẽ lập tức gỡ bỏ trạng thái bị gắn cờ của bài đăng, giữ nguyên bài đăng trên hệ thống và đóng báo cáo này lại.





UC_18: Xóa bài đăng (vi phạm nội quy/lừa đảo)
•	Mô tả ngắn gọn: Quản trị viên (Admin) thực hiện loại bỏ vĩnh viễn các bài đăng (Mất đồ hoặc Nhặt được đồ) khỏi hệ thống khi phát hiện hoặc xác minh được các bài đăng này vi phạm nội quy, có tính chất lừa đảo, spam hoặc chứa nội dung/hình ảnh nhạy cảm.
•	Tác nhân chính: Quản trị viên (Admin).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Quản trị viên đã đăng nhập hợp lệ vào hệ thống và đang thao tác tại Giao diện Quản lý (Admin Dashboard). Bài đăng cần xóa đang tồn tại trên hệ thống (có thể được phát hiện trực tiếp hoặc thông qua danh sách báo cáo từ người dùng).
•	Hậu điều kiện: Dữ liệu của bài đăng vi phạm bị xóa hoàn toàn khỏi cơ sở dữ liệu và không còn xuất hiện trên bất kỳ bảng tin hay giao diện nào của hệ thống.
•	Kịch bản chính:
1.	Tại Admin Dashboard, thông qua quá trình kiểm tra hoặc xử lý báo cáo, Quản trị viên xác định được một bài đăng vi phạm nội quy.
2.	Quản trị viên nhấn chọn chức năng Xóa bài đăng đối với bài đăng đó.
3.	Hệ thống hiển thị một hộp thoại cảnh báo, yêu cầu xác nhận việc xóa vĩnh viễn bài đăng ra khỏi hệ thống.
4.	Quản trị viên nhấn nút "Xác nhận" để đồng ý.
5.	Hệ thống tiếp nhận lệnh và gọi phương thức xoaBaiDang() của lớp Admin để thực thi việc xóa trực tiếp dữ liệu bài đăng này khỏi cơ sở dữ liệu.
6.	Hệ thống đóng hộp thoại, hiển thị thông báo "Xóa bài đăng thành công" và làm mới lại danh sách/bảng tin. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Quản trị viên hủy thao tác: Tại bước hiển thị hộp thoại cảnh báo xác nhận xóa, nếu Quản trị viên thay đổi quyết định (ví dụ: muốn kiểm tra lại thông tin) và nhấn nút "Hủy", hệ thống sẽ lập tức đóng hộp thoại, không thực thi lệnh xóa và bài đăng vẫn được giữ nguyên trạng thái hoạt động trên hệ thống.

UC_19: Thống kê và trích xuất báo cáo lịch sử hoạt động
•	Mô tả ngắn gọn: Quản trị viên (Admin) truy cập hệ thống để thống kê và trích xuất dữ liệu lịch sử về các món đồ đã được chuyển trạng thái "Trao trả thành công". Dữ liệu này được sử dụng để làm các báo cáo thống kê định kỳ nộp cho nhà trường (ví dụ: báo cáo trong tháng hệ thống đã giúp sinh viên tìm lại được bao nhiêu món đồ).
•	Tác nhân chính: Quản trị viên (Admin).
•	Tác nhân thứ cấp: Hệ thống.
•	Tiền điều kiện: Quản trị viên đã đăng nhập hợp lệ vào hệ thống và đang thao tác tại Giao diện Quản lý (Admin Dashboard). Hệ thống đã có dữ liệu lưu trữ về các bài đăng đã hoàn tất giao dịch.
•	Hậu điều kiện: Số liệu thống kê được hệ thống tổng hợp chính xác và file báo cáo được trích xuất thành công để phục vụ công tác quản lý của nhà trường.
•	Kịch bản chính:
1.	Tại Admin Dashboard, Quản trị viên truy cập vào mục "Thống kê và Báo cáo".
2.	Quản trị viên lựa chọn mốc thời gian cần thống kê (ví dụ: theo tuần, tháng, học kỳ).
3.	Hệ thống tiếp nhận yêu cầu và gọi đến phương thức trichXuatThongKe() của lớp Admin để xử lý.
4.	Hệ thống truy xuất cơ sở dữ liệu, tự động lọc và tổng hợp lịch sử của các món đồ đã hoàn tất quá trình và được chuyển trạng thái thành "Trao trả thành công".
5.	Hệ thống hiển thị biểu đồ hoặc các con số thống kê tổng quan lên màn hình (ví dụ: "Tháng này hệ thống đã giúp tìm lại 50 món đồ cho sinh viên").
6.	Quản trị viên nhấn chọn chức năng "Trích xuất báo cáo".
7.	Hệ thống tiến hành xuất toàn bộ dữ liệu ra định dạng file báo cáo và tải về thiết bị của Quản trị viên để nộp lên nhà trường. Kết thúc use case.
•	Kịch bản phụ:
o	4a. Không có dữ liệu: Nếu trong khoảng thời gian mà Quản trị viên lựa chọn không có bất kỳ món đồ nào được trao trả thành công, hệ thống sẽ hiển thị số liệu bằng 0 kèm thông báo "Không có dữ liệu trong khoảng thời gian này". Nút trích xuất báo cáo có thể bị vô hiệu hóa để tránh xuất ra file rỗng.





-----------------------------------------------------------
POLICY trên subapase đã được thiết lập như sau  :
2. Thiết lập Policies chi tiếtA. Bảng Danh Mục (danh_muc)Mọi người: Xem danh mục.  Admin: Toàn quyền thêm, sửa, xóa.  SQLCREATE POLICY "Cho phép mọi người xem danh mục" ON danh_muc FOR SELECT USING (true);
CREATE POLICY "Chỉ Admin mới có quyền chỉnh sửa danh mục" ON danh_muc 
FOR ALL TO authenticated USING (auth.jwt() ->> 'vai_tro' = 'admin');
B. Bảng Người Dùng (nguoi_dung)Cá nhân: Xem và cập nhật thông tin của chính mình.Hệ thống: Hiển thị thông tin liên lạc (SĐT, FB) chỉ khi Claim được chấp nhận.  SQLCREATE POLICY "Người dùng xem thông tin cá nhân của mình" ON nguoi_dung FOR SELECT 
USING (auth.uid() = id_nguoi_dung);

CREATE POLICY "Admin xem toàn bộ người dùng" ON nguoi_dung FOR SELECT 
USING (auth.jwt() ->> 'vai_tro' = 'admin');
C. Bảng Bài Đăng (bai_dang)Mọi người: Xem tất cả bài đăng đang hoạt động.  Người đăng: Có quyền sửa/xóa bài của mình.  Bảo vệ: Có quyền tạo bài đăng đại diện.  SQLCREATE POLICY "Mọi người xem bài đăng" ON bai_dang FOR SELECT USING (true);

CREATE POLICY "Người dùng tạo bài đăng cá nhân" ON bai_dang FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = id_nguoi_dang);

CREATE POLICY "Người dùng cập nhật bài đăng của mình" ON bai_dang FOR UPDATE 
USING (auth.uid() = id_nguoi_dang);
D. Bảng Yêu Cầu Nhận Đồ (yeu_cau_nhan_do)Người mất: Gửi yêu cầu và xem yêu cầu của mình.  Người nhặt: Xem các yêu cầu gửi đến bài đăng của mình để duyệt.  SQLCREATE POLICY "Người mất gửi yêu cầu nhận đồ" ON yeu_cau_nhan_do FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = id_nguoi_gui);

CREATE POLICY "Chủ bài đăng và người gửi xem được Claim" ON yeu_cau_nhan_do FOR SELECT 
USING (
  auth.uid() = id_nguoi_gui OR 
  auth.uid() IN (SELECT id_nguoi_dang FROM bai_dang WHERE id_bai_dang = yeu_cau_nhan_do.id_bai_dang)
);
E. Bảng Tin Nhắn (tin_nhan) - Quan trọng cho Chat nội bộĐiều kiện: Chỉ những người liên quan đến bài đăng và đã được chấp nhận mới được chat.  SQLCREATE POLICY "Chỉ người trong cuộc mới được xem tin nhắn" ON tin_nhan FOR SELECT 
USING (auth.uid() = id_nguoi_gui OR auth.uid() = id_nguoi_nhan);

CREATE POLICY "Chỉ người trong cuộc mới được gửi tin nhắn" ON tin_nhan FOR INSERT 
WITH CHECK (auth.uid() = id_nguoi_gui);
F. Bảng Báo Cáo (bao_cao)Người dùng: Tạo báo cáo.  Admin: Xem và xử lý báo cáo.  SQLCREATE POLICY "Người dùng gửi báo cáo" ON bao_cao FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = id_nguoi_bao_cao);

CREATE POLICY "Chỉ Admin xem báo cáo" ON bao_cao FOR SELECT 
USING (auth.jwt() ->> 'vai_tro' = 'admin');