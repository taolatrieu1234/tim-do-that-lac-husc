//GIAI ĐOẠN 2 : ĐĂNG TIN VÀ BẢNG TIN

const express = require('express');
const supabase = require('../db/supabase');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Lấy danh sách bài đăng
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bai_dang')
            .select('*, danh_muc(ten_danh_muc), nguoi_dung(email, vai_tro)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách bài đăng' });
    }
});

// Lấy chi tiết 1 bài đăng
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('bai_dang')
            .select('*, danh_muc(ten_danh_muc), nguoi_dung(email, vai_tro)')
            .eq('id_bai_dang', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
        
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi lấy chi tiết bài đăng' });
    }
});

// Tạo bài đăng mới (Đăng tin)
router.post('/', authenticate, upload.single('hinh_anh'), async (req, res) => {
    try {
        const { loai, tieu_de, mo_ta, vi_tri, id_danh_muc, is_dai_dien } = req.body;
        const id_nguoi_dang = req.user.sub;
        const vai_tro = req.user.vai_tro;

        // Validation
        if (!loai || !tieu_de || !vi_tri || !id_danh_muc) {
            return res.status(400).json({ error: 'Thiếu các trường thông tin bắt buộc' });
        }

        if (!['lost', 'found'].includes(loai)) {
            return res.status(400).json({ error: 'Loại bài đăng không hợp lệ' });
        }

        // Logic đại diện cho tổ chức (Bảo vệ)
        let isDaiDien = false;
        if (is_dai_dien === 'true' || is_dai_dien === true) {
            if (vai_tro !== 'bao_ve') {
                return res.status(403).json({ error: 'Chỉ có Bảo vệ/BQL mới được đăng tin đại diện' });
            }
            if (loai !== 'found') {
                return res.status(400).json({ error: 'Đăng tin đại diện chỉ dành cho món đồ Nhặt được (FOUND)' });
            }
            isDaiDien = true;
        }

        let hinhAnhUrl = null;

        // Xử lý upload ảnh lên Supabase Storage (Bucket: 'images')
        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${loai}/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('images')
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error("Lỗi upload ảnh:", uploadError);
                return res.status(500).json({ error: 'Lỗi khi tải ảnh lên hệ thống' });
            }

            // Lấy public URL của ảnh vừa upload
            const { data: publicUrlData } = supabase
                .storage
                .from('images')
                .getPublicUrl(filePath);

            hinhAnhUrl = publicUrlData.publicUrl;
        } else if (req.body.hinh_anh) {
            // Vẫn hỗ trợ nhận link nếu người dùng dán link từ bên ngoài
            hinhAnhUrl = req.body.hinh_anh;
        }

        const { data, error } = await supabase
            .from('bai_dang')
            .insert([{
                id_nguoi_dang,
                id_danh_muc,
                loai,
                tieu_de,
                mo_ta,
                vi_tri,
                hinh_anh: hinhAnhUrl,
                is_dai_dien: isDaiDien,
                trang_thai: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        // KỊCH BẢN SO KHỚP TỰ ĐỘNG (Auto-Matching)
        // Tìm các bài đăng ngược loại (lost -> found, found -> lost) cùng danh mục và đang pending
        const targetLoai = loai === 'lost' ? 'found' : 'lost';
        const { data: matches } = await supabase
            .from('bai_dang')
            .select('id_bai_dang, tieu_de, vi_tri, created_at, id_nguoi_dang')
            .eq('loai', targetLoai)
            .eq('id_danh_muc', id_danh_muc)
            .eq('trang_thai', 'pending')
            .neq('id_nguoi_dang', id_nguoi_dang) // Không tự khớp với bài của chính mình
            .order('created_at', { ascending: false })
            .limit(5);

        // NẾU TÌM THẤY TRÙNG KHỚP -> TẠO THÔNG BÁO CHO CẢ 2 BÊN
        if (matches && matches.length > 0) {
            const notifications = [];
            
            for (let match of matches) {
                // 1. Thông báo cho người vừa đăng (Bạn A)
                notifications.push({
                    id_nguoi_nhan: id_nguoi_dang,
                    tieu_de: 'Phát hiện bài đăng có thể trùng khớp!',
                    noi_dung: `Hệ thống tìm thấy bài đăng "${match.tieu_de}" có thể là món đồ bạn quan tâm.`,
                    link: `/post/${match.id_bai_dang}`
                });

                // 2. Thông báo cho chủ của bài đăng cũ (Bạn B)
                notifications.push({
                    id_nguoi_nhan: match.id_nguoi_dang,
                    tieu_de: 'Có người vừa đăng tin có thể liên quan đến bạn!',
                    noi_dung: `Một bài đăng mới "${data.tieu_de}" vừa được tạo có thể trùng với món đồ của bạn.`,
                    link: `/post/${data.id_bai_dang}`
                });
            }

            // Insert tất cả thông báo vào DB
            await supabase.from('thong_bao').insert(notifications);
        }

        res.status(201).json({ 
            message: 'Tạo bài đăng thành công', 
            data,
            matches: matches || [] // Trả về các kết quả có thể trùng khớp để gợi ý ngay cho người dùng
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi tạo bài đăng' });
    }
});

// Cập nhật trạng thái bài đăng (Bàn giao cho bảo vệ hoặc Hoàn tất trao trả)
router.put('/:id/status', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai, ghi_chu_ban_giao } = req.body;
        const userId = req.user.sub;

        // Chỉ cho phép pending -> delivered hoặc pending/delivered -> success
        if (!['delivered', 'success'].includes(trang_thai)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        // Kiểm tra quyền (phải là chủ bài đăng)
        const { data: post, error: fetchError } = await supabase
            .from('bai_dang')
            .select('id_nguoi_dang')
            .eq('id_bai_dang', id)
            .single();

        if (fetchError || !post) return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
        if (post.id_nguoi_dang !== userId) return res.status(403).json({ error: 'Bạn không có quyền cập nhật bài đăng này' });

        const updateData = { trang_thai };
        if (ghi_chu_ban_giao) {
            updateData.ghi_chu_ban_giao = ghi_chu_ban_giao;
        }

        const { data, error } = await supabase
            .from('bai_dang')
            .update(updateData)
            .eq('id_bai_dang', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Cập nhật trạng thái thành công', data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái' });
    }
});

module.exports = router;
