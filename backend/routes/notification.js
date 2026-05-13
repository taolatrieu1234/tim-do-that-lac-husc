//GIAI ĐOẠN 3: TÍNH NĂNG THÔNG BÁO

const express = require('express');
const supabase = require('../db/supabase');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Lấy danh sách thông báo của người dùng hiện tại
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.sub;

        const { data, error } = await supabase
            .from('thong_bao')
            .select('*')
            .eq('id_nguoi_nhan', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi lấy thông báo' });
    }
});

// Đánh dấu 1 thông báo đã đọc
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub;

        const { data, error } = await supabase
            .from('thong_bao')
            .update({ is_read: true })
            .eq('id_thong_bao', id)
            .eq('id_nguoi_nhan', userId)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Đã đánh dấu đọc', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi cập nhật thông báo' });
    }
});

// Đánh dấu tất cả thông báo đã đọc
router.put('/read-all', authenticate, async (req, res) => {
    try {
        const userId = req.user.sub;

        const { error } = await supabase
            .from('thong_bao')
            .update({ is_read: true })
            .eq('id_nguoi_nhan', userId)
            .eq('is_read', false);

        if (error) throw error;
        res.status(200).json({ message: 'Đã đánh dấu tất cả là đã đọc' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi cập nhật thông báo' });
    }
});

module.exports = router;
