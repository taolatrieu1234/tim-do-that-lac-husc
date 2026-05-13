import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/apiFetch';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function PostItem() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        loai: 'lost',
        tieu_de: '',
        mo_ta: '',
        vi_tri: '',
        id_danh_muc: '',
        is_dai_dien: false
    });
    const [hinhAnhFile, setHinhAnhFile] = useState(null);
    const [hinhAnhPreview, setHinhAnhPreview] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiFetch('/categories');
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, id_danh_muc: data[0].id_danh_muc }));
                }
            } catch (err) {
                console.error('Không tải được danh mục', err);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHinhAnhFile(file);
            setHinhAnhPreview(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setHinhAnhFile(null);
        setHinhAnhPreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

            const submitData = new FormData();
            submitData.append('loai', formData.loai);
            submitData.append('tieu_de', formData.tieu_de);
            submitData.append('mo_ta', formData.mo_ta);
            submitData.append('vi_tri', formData.vi_tri);
            submitData.append('id_danh_muc', formData.id_danh_muc);
            submitData.append('is_dai_dien', formData.is_dai_dien);

            if (hinhAnhFile) {
                submitData.append('hinh_anh', hinhAnhFile);
            }

            const response = await fetch(`${backendUrl}/api/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Không set Content-Type, fetch sẽ tự cấu hình cho FormData (bao gồm boundary)
                },
                body: submitData
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra khi gọi API');
            }

            alert('Đăng tin thành công!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Lỗi khi đăng tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                        ← Quay lại
                    </Link>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        Đăng Tin Mới
                    </h1>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto p-6 mt-8">
                <div className="glass rounded-2xl p-8 border border-slate-700 bg-slate-800/50">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Loại tin */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${formData.loai === 'lost' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                <input type="radio" name="loai" value="lost" checked={formData.loai === 'lost'} onChange={handleChange} className="hidden" />
                                <div className="font-semibold text-lg">Tôi Mất Đồ</div>
                                <div className="text-xs opacity-70 mt-1">Tìm kiếm đồ vật bị thất lạc</div>
                            </label>

                            <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${formData.loai === 'found' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                <input type="radio" name="loai" value="found" checked={formData.loai === 'found'} onChange={handleChange} className="hidden" />
                                <div className="font-semibold text-lg">Tôi Nhặt Được Đồ</div>
                                <div className="text-xs opacity-70 mt-1">Trả lại đồ cho người mất</div>
                            </label>
                        </div>

                        {/* Đăng tin đại diện (Chỉ Bảo vệ) */}
                        {user?.vai_tro === 'bao_ve' && formData.loai === 'found' && (
                            <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-xl flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_dai_dien"
                                    name="is_dai_dien"
                                    checked={formData.is_dai_dien}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
                                />
                                <label htmlFor="is_dai_dien" className="text-blue-200 text-sm">
                                    Đăng tin đại diện cho Tổ chức / Phòng Bảo vệ (Thay vì cá nhân)
                                </label>
                            </div>
                        )}

                        {/* Tiêu đề */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Tiêu đề <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                name="tieu_de"
                                required
                                value={formData.tieu_de}
                                onChange={handleChange}
                                placeholder="Ví dụ: Rơi ví da màu đen tại nhà A..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Danh mục & Vị trí */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Danh mục <span className="text-red-400">*</span></label>
                                <select
                                    name="id_danh_muc"
                                    required
                                    value={formData.id_danh_muc}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id_danh_muc} value={cat.id_danh_muc}>
                                            {cat.ten_danh_muc}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Vị trí (Mất/Nhặt được) <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    name="vi_tri"
                                    required
                                    value={formData.vi_tri}
                                    onChange={handleChange}
                                    placeholder="Tầng 2, nhà C..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả chi tiết</label>
                            <textarea
                                name="mo_ta"
                                rows="4"
                                value={formData.mo_ta}
                                onChange={handleChange}
                                placeholder="Mô tả các đặc điểm (Nên giữ lại một vài đặc điểm ẩn nếu bạn nhặt được đồ để xác minh người nhận)..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            ></textarea>
                        </div>

                        {/* Tải lên Hình ảnh */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Hình ảnh đồ vật (Tùy chọn)</label>
                            <div className="flex flex-col gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer transition-all"
                                />
                                {hinhAnhPreview && (
                                    <div className="relative inline-block w-48 rounded-xl overflow-hidden border border-slate-700">
                                        <img src={hinhAnhPreview} alt="Preview" className="w-full h-auto object-cover" />
                                        <button
                                            type="button"
                                            onClick={clearFile}
                                            className="absolute top-2 right-2 bg-slate-900/70 hover:bg-red-500/90 text-white rounded-full p-1.5 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Đang tải lên và xử lý...' : 'Đăng Tin Ngay'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
