import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/apiFetch';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & Mật khẩu mới
    
    // States cho Step 1
    const [email, setEmail] = useState('');
    const [loadingEmail, setLoadingEmail] = useState(false);
    
    // States cho Step 2
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingReset, setLoadingReset] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoadingEmail(true);

        try {
            const data = await apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            setSuccess('Mã OTP đã được gửi đến email của bạn!');
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp');
        }
        if (newPassword.length < 6) {
            return setError('Mật khẩu phải có ít nhất 6 ký tự');
        }

        setLoadingReset(true);
        try {
            const data = await apiFetch('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ email, otp, newPassword })
            });

            alert('Khôi phục mật khẩu thành công! Vui lòng đăng nhập lại.');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingReset(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans text-slate-200">
            <div className="max-w-md w-full glass p-8 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        Khôi Phục Mật Khẩu
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {step === 1 ? 'Nhập email @husc.edu.vn của bạn để nhận mã OTP' : `Mã OTP đã được gửi tới ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium">
                        {error}
                    </div>
                )}
                {success && step === 1 && (
                    <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm font-medium">
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Email HUSC</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500"
                                placeholder="mssv@husc.edu.vn"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loadingEmail}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/50 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                            {loadingEmail ? 'Đang gửi...' : 'Gửi mã OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Mã OTP (6 số)</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Chỉ cho nhập số
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500 tracking-widest text-center text-xl font-bold"
                                placeholder="------"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Mật khẩu mới</label>
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loadingReset}
                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/50 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-2"
                        >
                            {loadingReset ? 'Đang xử lý...' : 'Xác nhận Đổi Mật Khẩu'}
                        </button>

                        <div className="text-center mt-4">
                            <button 
                                type="button" 
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                            >
                                ← Quay lại gửi lại mã
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                    <p className="text-slate-400 text-sm">
                        Nhớ ra mật khẩu rồi? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
