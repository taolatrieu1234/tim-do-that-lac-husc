const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'your-super-secret-jwt-token-with-at-least-32-characters-long';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Truy cập bị từ chối. Không tìm thấy token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.vai_tro === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Yêu cầu quyền Admin.' });
    }
};

module.exports = { authenticate, requireAdmin };
