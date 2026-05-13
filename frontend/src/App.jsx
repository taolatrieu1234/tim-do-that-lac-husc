//phải đi qua PrivateRoute để check đăng nhập

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CategoryManager from './pages/Admin/CategoryManager';
import PostItem from './pages/PostItem';
import PostDetail from './pages/PostDetail';

// Component để bảo vệ các route cần đăng nhập
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200">Đang tải...</div>;

    return user ? children : <Navigate to="/login" />;
};

// Component để chuyển hướng nếu đã đăng nhập rồi (không cho vào trang login/register nữa)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200">Đang tải...</div>;

    return !user ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />

            <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
            } />

            <Route path="/forgot-password" element={
                <PublicRoute>
                    <ForgotPassword />
                </PublicRoute>
            } />

            <Route path="/dashboard" element={
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
            } />

            <Route path="/post" element={
                <PrivateRoute>
                    <PostItem />
                </PrivateRoute>
            } />

            <Route path="/post/:id" element={
                <PrivateRoute>
                    <PostDetail />
                </PrivateRoute>
            } />

            <Route path="/admin/categories" element={
                <PrivateRoute>
                    <CategoryManager />
                </PrivateRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
