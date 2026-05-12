export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    // Đọc URL từ biến môi trường
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${backendUrl}/api${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gọi API');
    }

    return data;
};
