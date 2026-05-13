import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/apiFetch';
import { useAuth } from '../contexts/AuthContext';

export default function PostDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho form gửi yêu cầu nhận đồ (Claim)
    const [claimDesc, setClaimDesc] = useState('');
    const [claimFile, setClaimFile] = useState(null);
    const [claimLoading, setClaimLoading] = useState(false);
    const fileInputRef = useRef(null);

    const loadData = async () => {
        setLoading(true);
        try {
            // Lấy chi tiết bài đăng
            // Ghi chú: Cần bổ sung API GET /api/posts/:id ở backend nếu chưa có
            const data = await apiFetch(`/posts/${id}`);
            setPost(data);

            // Nếu là chủ bài đăng, tải danh sách Claims
            if (data.id_nguoi_dang === user.sub || data.id_nguoi_dang === user.id_nguoi_dung) {
                const claimData = await apiFetch(`/claims/post/${id}`);
                setClaims(claimData);
            }
        } catch (err) {
            setError('Không tìm thấy bài đăng hoặc có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        setClaimLoading(true);
        try {
            const token = localStorage.getItem('token');
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
            
            const formData = new FormData();
            formData.append('id_bai_dang', id);
            formData.append('bang_chung_mo_ta', claimDesc);
            if (claimFile) {
                formData.append('bang_chung_hinh_anh', claimFile);
            }

            const response = await fetch(`${backendUrl}/api/claims`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            alert('Đã gửi yêu cầu nhận đồ thành công! Vui lòng chờ người đăng phê duyệt.');
            setClaimDesc('');
            setClaimFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            
        } catch (err) {
            alert(err.message || 'Lỗi khi gửi yêu cầu');
        } finally {
            setClaimLoading(false);
        }
    };

    const handleAcceptClaim = async (idYeuCau) => {
        if (!window.confirm('Bạn chắc chắn muốn chấp nhận yêu cầu này và giao đồ cho người này?')) return;
        try {
            await apiFetch(`/claims/${idYeuCau}/accept`, { method: 'PUT' });
            alert('Đã chấp nhận yêu cầu. Trạng thái bài đăng đã chuyển sang Chờ bàn giao.');
            loadData(); // Tải lại để cập nhật trạng thái
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-900 text-slate-200 p-8 text-center">Đang tải...</div>;
    if (error || !post) return <div className="min-h-screen bg-slate-900 text-slate-200 p-8 text-center">{error}</div>;

    const isOwner = post.id_nguoi_dang === user.sub || post.id_nguoi_dang === user.id_nguoi_dung;
    const isFound = post.loai === 'found';

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                    ← Quay lại bảng tin
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto p-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CHI TIẾT BÀI ĐĂNG */}
                <div className="glass rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/50 flex flex-col">
                    {post.hinh_anh && (
                        <div className="w-full h-64 bg-slate-900/50">
                            <img src={post.hinh_anh} alt={post.tieu_de} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-6 space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isFound ? 'bg-emerald-600/20 text-emerald-400' : 'bg-indigo-600/20 text-indigo-400'}`}>
                                {isFound ? 'Nhặt Được Đồ' : 'Mất Đồ'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                post.trang_thai === 'pending' ? 'bg-yellow-600/20 text-yellow-400' : 
                                post.trang_thai === 'delivered' ? 'bg-blue-600/20 text-blue-400' :
                                'bg-green-600/20 text-green-400'
                            }`}>
                                {post.trang_thai === 'pending' ? 'Đang tìm kiếm' : 
                                 post.trang_thai === 'delivered' ? 'Đã bàn giao/Chờ nhận' : 'Trao trả thành công'}
                            </span>
                        </div>
                        
                        <h1 className="text-2xl font-bold text-white">{post.tieu_de}</h1>
                        
                        <div className="bg-slate-900/50 rounded-xl p-4 space-y-2 text-sm text-slate-300 border border-slate-700/50">
                            <p><span className="text-slate-500 w-24 inline-block">Danh mục:</span> {post.danh_muc?.ten_danh_muc}</p>
                            <p><span className="text-slate-500 w-24 inline-block">Vị trí:</span> {post.vi_tri}</p>
                            <p><span className="text-slate-500 w-24 inline-block">Người đăng:</span> {post.nguoi_dung?.email} {post.is_dai_dien && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded ml-2">Đại diện Tổ chức</span>}</p>
                            <p><span className="text-slate-500 w-24 inline-block">Ngày đăng:</span> {new Date(post.created_at).toLocaleString('vi-VN')}</p>
                            {post.ghi_chu_ban_giao && (
                                <div className="mt-2 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg text-amber-200">
                                    <span className="font-bold">Ghi chú bàn giao:</span> {post.ghi_chu_ban_giao}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-300 mb-2">Mô tả chi tiết:</h3>
                            <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">{post.mo_ta || 'Không có mô tả chi tiết.'}</p>
                        </div>
                    </div>

                    {/* CÁC NÚT HÀNH ĐỘNG CỦA CHỦ BÀI ĐĂNG (UC_6) */}
                    {isOwner && post.trang_thai !== 'success' && (
                        <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Quản lý bài đăng</h3>
                            
                            {post.trang_thai === 'pending' && (
                                <button 
                                    onClick={async () => {
                                        const note = window.prompt('Nhập ghi chú bàn giao (vd: "Đã gửi tại phòng bảo vệ tầng 1"):');
                                        if (note === null) return;
                                        try {
                                            await apiFetch(`/posts/${id}/status`, {
                                                method: 'PUT',
                                                body: JSON.stringify({ trang_thai: 'delivered', ghi_chu_ban_giao: note })
                                            });
                                            alert('Đã cập nhật trạng thái bàn giao!');
                                            loadData();
                                        } catch(e) { alert(e.message) }
                                    }}
                                    className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold rounded-xl transition-colors"
                                >
                                    Bàn giao đồ cho Bảo vệ
                                </button>
                            )}

                            <button 
                                onClick={async () => {
                                    if(!window.confirm('Xác nhận đã trao trả món đồ thành công cho đúng chủ nhân?')) return;
                                    try {
                                        await apiFetch(`/posts/${id}/status`, {
                                            method: 'PUT',
                                            body: JSON.stringify({ trang_thai: 'success' })
                                        });
                                        alert('Chúc mừng! Bài đăng đã hoàn tất.');
                                        loadData();
                                    } catch(e) { alert(e.message) }
                                }}
                                className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors shadow-lg"
                            >
                                Đánh dấu: Đã Trao Trả Thành Công
                            </button>
                        </div>
                    )}
                </div>

                {/* KHU VỰC YÊU CẦU NHẬN ĐỒ (CLAIM) */}
                <div className="space-y-6">
                    {!isOwner && isFound && post.trang_thai === 'pending' && (
                        <div className="glass rounded-2xl p-6 border border-slate-700 bg-slate-800/50">
                            <h2 className="text-xl font-bold text-white mb-4">Đây là đồ của bạn?</h2>
                            <p className="text-sm text-slate-400 mb-6">Hãy gửi yêu cầu nhận lại đồ bằng cách cung cấp bằng chứng chứng minh bạn là chủ nhân (ví dụ: ảnh cũ chụp món đồ, mô tả vết xước, hình nền điện thoại...)</p>
                            
                            <form onSubmit={handleClaimSubmit} className="space-y-4">
                                <div>
                                    <textarea 
                                        required
                                        value={claimDesc}
                                        onChange={(e) => setClaimDesc(e.target.value)}
                                        placeholder="Mô tả các đặc điểm nhận dạng ẩn..."
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        rows="4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Tải lên ảnh bằng chứng (Tùy chọn)</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={(e) => setClaimFile(e.target.files[0])}
                                        className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-700 file:text-white hover:file:bg-slate-600 file:cursor-pointer transition-all"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={claimLoading}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {claimLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu Nhận Đồ'}
                                </button>
                            </form>
                        </div>
                    )}

                    {isOwner && isFound && (
                        <div className="glass rounded-2xl p-6 border border-slate-700 bg-slate-800/50">
                            <h2 className="text-xl font-bold text-white mb-4">Danh sách Yêu cầu nhận đồ</h2>
                            {claims.length === 0 ? (
                                <p className="text-slate-400 italic">Chưa có ai gửi yêu cầu nhận món đồ này.</p>
                            ) : (
                                <div className="space-y-4">
                                    {claims.map((claim) => (
                                        <div key={claim.id_yeu_cau} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-medium text-emerald-400">{claim.nguoi_dung?.email}</div>
                                                <div className="text-xs text-slate-500">{new Date(claim.created_at).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                            <p className="text-sm text-slate-300 mb-3 bg-slate-800 p-3 rounded-lg">{claim.bang_chung_mo_ta}</p>
                                            
                                            {claim.bang_chung_hinh_anh && (
                                                <img src={claim.bang_chung_hinh_anh} alt="Bằng chứng" className="w-full max-w-xs rounded-lg mb-3 border border-slate-700" />
                                            )}

                                            <div className="pt-3 border-t border-slate-700/50 flex justify-end">
                                                {claim.is_accepted ? (
                                                    <span className="text-emerald-400 font-bold bg-emerald-900/30 px-3 py-1 rounded">Đã Chấp Nhận</span>
                                                ) : post.trang_thai === 'pending' ? (
                                                    <button 
                                                        onClick={() => handleAcceptClaim(claim.id_yeu_cau)}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg"
                                                    >
                                                        Chấp nhận người này
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
