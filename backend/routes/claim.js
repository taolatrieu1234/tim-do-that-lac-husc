//GIAI ĐOẠN 3: QUẢN LÝ YÊU CẦU NHẬN ĐỒ

const express = require('express');
const supabase = require('../db/supabase');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// 1. Tạo yêu cầu nhận đồ (Claim)
router.post('/', authenticate, upload.single('bang_chung_hinh_anh'), async (req, res) => {
    try {
        const { id_bai_dang, bang_chung_mo_ta } = req.body;
        const id_nguoi_gui = req.user.sub;

        if (!id_bai_dang || !bang_chung_mo_ta) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // Kiểm tra bài đăng có tồn tại không và có phải bài đăng Found không
        const { data: post, error: postError } = await supabase
            .from('bai_dang')
            .select('loai, id_nguoi_dang, trang_thai')
            .eq('id_bai_dang', id_bai_dang)
            .single();

        if (postError || !post) return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
        if (post.loai !== 'found') return res.status(400).json({ error: 'Chỉ có thể Claim đối với đồ nhặt được' });
        if (post.id_nguoi_dang === id_nguoi_gui) return res.status(400).json({ error: 'Bạn không thể Claim bài đăng của chính mình' });
        if (post.trang_thai !== 'pending') return res.status(400).json({ error: 'Bài đăng này đã được giải quyết' });

        // Xử lý upload ảnh bằng chứng
        let bangChungHinhAnhUrl = null;
        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `claim_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `claims/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('images').upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype
            });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
            bangChungHinhAnhUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('yeu_cau_nhan_do')
            .insert([{
                id_bai_dang,
                id_nguoi_gui,
                bang_chung_mo_ta,
                bang_chung_hinh_anh: bangChungHinhAnhUrl
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Đã gửi yêu cầu nhận đồ', data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi gửi yêu cầu' });
    }
});

// 2. Lấy danh sách Claim của 1 bài đăng (Dành cho chủ bài đăng)
router.get('/post/:id_bai_dang', authenticate, async (req, res) => {
    try {
        const { id_bai_dang } = req.params;
        const userId = req.user.sub;

        // Xác thực người xem có phải chủ bài đăng không
        const { data: post } = await supabase
            .from('bai_dang')
            .select('id_nguoi_dang')
            .eq('id_bai_dang', id_bai_dang)
            .single();

        if (!post || post.id_nguoi_dang !== userId) {
            return res.status(403).json({ error: 'Chỉ chủ bài đăng mới được xem yêu cầu' });
        }

        const { data, error } = await supabase
            .from('yeu_cau_nhan_do')
            .select('*, nguoi_dung(email, so_dien_thoai, vai_tro)')
            .eq('id_bai_dang', id_bai_dang)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách yêu cầu' });
    }
});

// 3. Duyệt (Chấp nhận) Yêu cầu
router.put('/:id_yeu_cau/accept', authenticate, async (req, res) => {
    try {
        const { id_yeu_cau } = req.params;
        const userId = req.user.sub;

        // Lấy thông tin yêu cầu và bài đăng
        const { data: claim, error: claimError } = await supabase
            .from('yeu_cau_nhan_do')
            .select('id_bai_dang, bai_dang(id_nguoi_dang, trang_thai)')
            .eq('id_yeu_cau', id_yeu_cau)
            .single();

        if (claimError || !claim) return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });

        if (claim.bai_dang.id_nguoi_dang !== userId) {
            return res.status(403).json({ error: 'Chỉ chủ bài đăng mới được duyệt yêu cầu' });
        }
        if (claim.bai_dang.trang_thai !== 'pending') {
            return res.status(400).json({ error: 'Bài đăng này không ở trạng thái chờ duyệt' });
        }

        // Cập nhật trạng thái Yêu cầu thành Accepted
        await supabase
            .from('yeu_cau_nhan_do')
            .update({ is_accepted: true })
            .eq('id_yeu_cau', id_yeu_cau);

        // Cập nhật trạng thái Bài đăng thành delivered (đã có người nhận, chờ bàn giao)
        await supabase
            .from('bai_dang')
            .update({ trang_thai: 'delivered' })
            .eq('id_bai_dang', claim.id_bai_dang);

        res.status(200).json({ message: 'Đã chấp nhận yêu cầu nhận đồ. Trạng thái bài đăng chuyển thành chờ bàn giao (delivered).' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi duyệt yêu cầu' });
    }
});

module.exports = router;
