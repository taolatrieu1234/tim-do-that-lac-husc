//GIAI ĐOẠN 2 : FRONTEND ADMIN - QUẢN LÝ DANH MỤC

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/apiFetch';
import { useAuth } from '../../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    // Chỉ Admin mới được vào trang này
    if (user && user.vai_tro !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    const fetchCategories = async () => {
        try {
            const data = await apiFetch('/categories');
            setCategories(data);
        } catch (err) {
            setError(err.message || 'Không thể tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const showMessage = (type, msg) => {
        if (type === 'error') setError(msg);
        if (type === 'success') setSuccess(msg);
        setTimeout(() => {
            setError('');
            setSuccess('');
        }, 3000);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await apiFetch('/categories', {
                method: 'POST',
                body: JSON.stringify({ ten_danh_muc: newCategoryName.trim() })
            });
            showMessage('success', 'Thêm danh mục thành công');
            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            showMessage('error', err.message);
        }
    };

    const handleUpdate = async (e, id) => {
        e.preventDefault();
        if (!editingName.trim()) return;
        try {
            await apiFetch(`/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ ten_danh_muc: editingName.trim() })
            });
            showMessage('success', 'Cập nhật danh mục thành công');
            setEditingId(null);
            fetchCategories();
        } catch (err) {
            showMessage('error', err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        try {
            await apiFetch(`/categories/${id}`, { method: 'DELETE' });
            showMessage('success', 'Xóa danh mục thành công');
            fetchCategories();
        } catch (err) {
            showMessage('error', err.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-300">Đang tải danh mục...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                        ← Quay lại
                    </Link>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        Quản Lý Danh Mục
                    </h1>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-6 mt-8">
                {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl">{error}</div>}
                {success && <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-200 rounded-xl">{success}</div>}

                {/* Form Thêm Mới */}
                <div className="glass rounded-2xl p-6 border border-slate-700 bg-slate-800/50 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Thêm Danh Mục Mới</h2>
                    <form onSubmit={handleAdd} className="flex gap-4">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nhập tên danh mục..."
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
                        >
                            Thêm
                        </button>
                    </form>
                </div>

                {/* Danh Sách Danh Mục */}
                <div className="glass rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/80 border-b border-slate-700">
                                <th className="p-4 font-semibold text-slate-300">Tên Danh Mục</th>
                                <th className="p-4 font-semibold text-slate-300 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id_danh_muc} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                    <td className="p-4">
                                        {editingId === cat.id_danh_muc ? (
                                            <form onSubmit={(e) => handleUpdate(e, cat.id_danh_muc)}>
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    autoFocus
                                                />
                                            </form>
                                        ) : (
                                            <span className="text-slate-300">{cat.ten_danh_muc}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {editingId === cat.id_danh_muc ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={(e) => handleUpdate(e, cat.id_danh_muc)} className="text-emerald-400 hover:text-emerald-300 font-medium">Lưu</button>
                                                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300 font-medium">Hủy</button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-4">
                                                <button
                                                    onClick={() => { setEditingId(cat.id_danh_muc); setEditingName(cat.ten_danh_muc); }}
                                                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id_danh_muc)}
                                                    className="text-red-400 hover:text-red-300 font-medium"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="p-8 text-center text-slate-500">
                                        Chưa có danh mục nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
