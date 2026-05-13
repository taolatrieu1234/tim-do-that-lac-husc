//GIAI ĐOẠN 2  : FRONTEND-Cập nhật bảng tin 

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/apiFetch';
import NotificationBell from '../components/NotificationBell';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await apiFetch('/posts');
                setPosts(data);
            } catch (err) {
                console.error('Lỗi khi tải bài đăng:', err);
            }
        };
        loadPosts();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    Tìm Đồ HUSC
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 hidden sm:inline">Xin chào, {user?.email}</span>

                    <NotificationBell />

                    <Link to="/post" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors shadow-lg">
                        + Đăng Tin Mới
                    </Link>

                    {user?.vai_tro === 'admin' && (
                        <Link to="/admin/categories" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors shadow-lg">
                            Quản lý Danh mục
                        </Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        Đăng xuất
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 mt-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-100">Bảng Tin</h2>
                    <p className="text-slate-400">Danh sách các món đồ đang được tìm kiếm hoặc nhặt được</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-slate-500 glass rounded-2xl border border-slate-700">
                            Chưa có bài đăng nào. Hãy là người đầu tiên đăng tin!
                        </div>
                    ) : (
                        posts.map(post => (
                            <Link to={`/post/${post.id_bai_dang}`} key={post.id_bai_dang} className="glass rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 transition-all group flex flex-col cursor-pointer block">
                                <div className={`p-1.5 text-center text-xs font-bold tracking-wider uppercase ${post.loai === 'lost' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                                    {post.loai === 'lost' ? 'Mất Đồ' : 'Nhặt Được'}
                                </div>
                                
                                {post.hinh_anh && (
                                    <div className="w-full h-48 bg-slate-900/50 overflow-hidden border-b border-slate-700/50">
                                        <img src={post.hinh_anh} alt={post.tieu_de} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{post.tieu_de}</h3>

                                    <div className="space-y-2 mb-4 text-sm text-slate-300 flex-1">
                                        <p><span className="text-slate-500">Danh mục:</span> {post.danh_muc?.ten_danh_muc}</p>
                                        <p><span className="text-slate-500">Vị trí:</span> {post.vi_tri}</p>
                                        <p className="line-clamp-2"><span className="text-slate-500">Mô tả:</span> {post.mo_ta}</p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                                        <span className="text-xs text-slate-500">
                                            {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                        {post.is_dai_dien && (
                                            <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded border border-blue-800/50">
                                                Tin Đại Diện
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
