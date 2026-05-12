const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db/supabase');
const router = express.Router();

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'your-super-secret-jwt-token-with-at-least-32-characters-long';

// Helper function to create custom JWT compatible with Supabase RLS
const createCustomJWT = (user) => {
    return jwt.sign(
        {
            role: 'authenticated', // Required for Supabase RLS
            sub: user.id_nguoi_dung, // Maps to auth.uid()
            vai_tro: user.vai_tro,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Đăng ký (Register)
router.post('/register', async (req, res) => {
    try {
        const { email, password, vai_tro, so_dien_thoai, facebook_link } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
        }
        if (!email.endsWith('@husc.edu.vn')) {
            return res.status(400).json({ error: 'Email phải có định dạng @husc.edu.vn' });
        }

        // Kiểm tra email tồn tại
        const { data: existingUser } = await supabase
            .from('nguoi_dung')
            .select('id_nguoi_dung')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email đã được sử dụng' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu vào database
        const { data: newUser, error } = await supabase
            .from('nguoi_dung')
            .insert([
                {
                    email,
                    mat_khau: hashedPassword, // Yêu cầu thêm cột mat_khau vào bảng nguoi_dung trong Supabase
                    vai_tro: vai_tro || 'sinh_vien',
                    so_dien_thoai: so_dien_thoai || null,
                    facebook_link: facebook_link || null
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Lỗi insert:", error);
            return res.status(500).json({ error: 'Không thể tạo tài khoản', details: error.message });
        }

        const token = createCustomJWT(newUser);

        // Trả về user info (ẩn mật khẩu)
        const { mat_khau, ...userWithoutPassword } = newUser;
        
        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: userWithoutPassword
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

// Đăng nhập (Login)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Vui lòng cung cấp email và mật khẩu' });
        }
        if (!email.endsWith('@husc.edu.vn')) {
            return res.status(400).json({ error: 'Email phải có định dạng @husc.edu.vn' });
        }

        // Lấy thông tin user
        const { data: user, error } = await supabase
            .from('nguoi_dung')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.mat_khau);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        const token = createCustomJWT(user);
        
        // Ẩn mật khẩu khi trả về
        const { mat_khau, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: userWithoutPassword
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

module.exports = router;
