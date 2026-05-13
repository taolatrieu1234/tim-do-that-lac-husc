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

// Gửi mã OTP Quên mật khẩu
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Vui lòng cung cấp email' });

        // Kiểm tra user có tồn tại không
        const { data: user, error: fetchError } = await supabase
            .from('nguoi_dung')
            .select('id_nguoi_dung, email')
            .eq('email', email)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ error: 'Email không tồn tại trong hệ thống' });
        }

        // Tạo mã OTP 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Hết hạn sau 10 phút
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Lưu OTP vào database (yêu cầu thêm cột reset_otp và reset_otp_expires vào bảng nguoi_dung)
        const { error: updateError } = await supabase
            .from('nguoi_dung')
            .update({
                reset_otp: otp,
                reset_otp_expires: expiresAt
            })
            .eq('id_nguoi_dung', user.id_nguoi_dung);

        if (updateError) {
            console.error(updateError);
            return res.status(500).json({ error: 'Lỗi khi tạo mã OTP' });
        }

        // Gửi email qua Resend
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { error: emailError } = await resend.emails.send({
            from: 'TimDoHUSC <onboarding@resend.dev>', // Email mặc định của Resend để test
            to: [email],
            subject: 'Mã xác nhận Khôi phục mật khẩu - Tìm Đồ Thất Lạc HUSC',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Khôi phục mật khẩu</h2>
                    <p>Chào bạn,</p>
                    <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản <b>${email}</b>.</p>
                    <p>Mã xác nhận (OTP) của bạn là:</p>
                    <h1 style="color: #4f46e5; letter-spacing: 5px;">${otp}</h1>
                    <p><i>Lưu ý: Mã này sẽ hết hạn sau 10 phút. Tuyệt đối không chia sẻ mã này cho người khác.</i></p>
                    <br/>
                    <p>Trân trọng,<br/>Đội ngũ Hỗ trợ Tìm Đồ HUSC</p>
                </div>
            `
        });

        if (emailError) {
            console.error('Lỗi gửi email Resend:', emailError);
            return res.status(500).json({ error: 'Không thể gửi email OTP, vui lòng thử lại sau.' });
        }

        res.status(200).json({ message: 'Mã OTP đã được gửi đến email của bạn.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

// Xác nhận OTP và đặt lại mật khẩu
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
        }

        // Tìm user và kiểm tra OTP
        const { data: user, error: fetchError } = await supabase
            .from('nguoi_dung')
            .select('*')
            .eq('email', email)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        if (user.reset_otp !== otp) {
            return res.status(400).json({ error: 'Mã OTP không chính xác' });
        }

        const now = new Date();
        const expiresAt = new Date(user.reset_otp_expires);

        if (now > expiresAt) {
            return res.status(400).json({ error: 'Mã OTP đã hết hạn' });
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật DB: set mật khẩu mới và xóa mã OTP cũ
        const { error: updateError } = await supabase
            .from('nguoi_dung')
            .update({
                mat_khau: hashedPassword,
                reset_otp: null,
                reset_otp_expires: null
            })
            .eq('id_nguoi_dung', user.id_nguoi_dung);

        if (updateError) {
            console.error(updateError);
            return res.status(500).json({ error: 'Lỗi khi cập nhật mật khẩu mới' });
        }

        res.status(200).json({ message: 'Khôi phục mật khẩu thành công. Vui lòng đăng nhập lại!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

module.exports = router;
