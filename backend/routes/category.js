//GIAI ĐOẠN 2 : QUẢN LÝ DANH MỤC

const express = require('express');
const supabase = require('../db/supabase');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Lấy danh sách danh mục (Ai cũng xem được)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('danh_muc')
            .select('*')
            .order('ten_danh_muc', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách danh mục' });
    }
});

// Thêm danh mục mới (Chỉ Admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { ten_danh_muc } = req.body;
        if (!ten_danh_muc) return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });

        const { data, error } = await supabase
            .from('danh_muc')
            .insert([{ ten_danh_muc }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Lỗi trùng lặp UNIQUE constraint
                return res.status(400).json({ error: 'Danh mục này đã tồn tại' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Thêm danh mục thành công', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi thêm danh mục' });
    }
});

// Sửa danh mục (Chỉ Admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_danh_muc } = req.body;
        if (!ten_danh_muc) return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });

        const { data, error } = await supabase
            .from('danh_muc')
            .update({ ten_danh_muc })
            .eq('id_danh_muc', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Không tìm thấy danh mục' });

        res.status(200).json({ message: 'Cập nhật danh mục thành công', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi sửa danh mục' });
    }
});

// Xóa danh mục (Chỉ Admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem danh mục có bài đăng nào đang sử dụng không
        const { data: posts, error: checkError } = await supabase
            .from('bai_dang')
            .select('id_bai_dang')
            .eq('id_danh_muc', id)
            .limit(1);

        if (checkError) throw checkError;
        if (posts && posts.length > 0) {
            return res.status(400).json({ error: 'Không thể xóa danh mục đang có bài đăng sử dụng.' });
        }

        const { error } = await supabase
            .from('danh_muc')
            .delete()
            .eq('id_danh_muc', id);

        if (error) throw error;
        res.status(200).json({ message: 'Xóa danh mục thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi xóa danh mục' });
    }
});

module.exports = router;
