import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    Tìm Đồ HUSC
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">Xin chào, {user?.email}</span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        Đăng xuất
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 mt-8">
                <div className="glass rounded-2xl p-8 border border-slate-700 bg-slate-800/50">
                    <h2 className="text-2xl font-semibold mb-4">Dashboard (Đang phát triển)</h2>
                    <p className="text-slate-400">
                        Bạn đã đăng nhập thành công với vai trò: <span className="text-indigo-400 font-medium">{user?.vai_tro}</span>
                    </p>
                </div>
            </main>
        </div>
    );
}
