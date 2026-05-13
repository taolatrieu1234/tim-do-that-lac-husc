//GIAI ĐOẠN 3: FRONTEND - TÍNH NĂNG THÔNG BÁO

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/apiFetch';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const loadNotifications = async () => {
        try {
            const data = await apiFetch('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Lỗi khi tải thông báo', err);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Cập nhật thông báo định kỳ mỗi 30 giây (Polling)
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(notifications.map(n =>
                n.id_thong_bao === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async (e) => {
        e.preventDefault();
        try {
            await apiFetch('/notifications/read-all', { method: 'PUT' });
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-300 hover:text-white transition-colors"
            >
                {/* SVG Chuông */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Chấm đỏ */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-white text-sm">Thông Báo</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs text-indigo-400 hover:text-indigo-300">
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                Chưa có thông báo nào.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <Link
                                    to={n.link || '#'}
                                    key={n.id_thong_bao}
                                    onClick={() => setIsOpen(false)}
                                    className={`block p-4 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors ${!n.is_read ? 'bg-slate-800/50' : 'opacity-70'}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <div className={`text-sm font-semibold mb-1 ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>
                                                {n.tieu_de}
                                            </div>
                                            <div className="text-xs text-slate-400 line-clamp-2">
                                                {n.noi_dung}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-2">
                                                {new Date(n.created_at).toLocaleString('vi-VN')}
                                            </div>
                                        </div>
                                        {!n.is_read && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(n.id_thong_bao, e)}
                                                title="Đánh dấu đã đọc"
                                                className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"
                                            />
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
