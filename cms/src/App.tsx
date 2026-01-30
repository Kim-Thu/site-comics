import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './presentation/layouts/MainLayout';
import CategoriesManager from './presentation/pages/CategoriesManager';
import ChaptersManager from './presentation/pages/ChaptersManager';
import ComicForm from './presentation/pages/ComicForm';
import ComicsManager from './presentation/pages/ComicsManager';
import Dashboard from './presentation/pages/Dashboard';
import FooterBuilder from './presentation/pages/FooterBuilder';
import ForgotPassword from './presentation/pages/ForgotPassword';
import HeaderBuilder from './presentation/pages/HeaderBuilder';
import LayoutSettings from './presentation/pages/LayoutSettings';
import Login from './presentation/pages/Login';
import MediaManager from './presentation/pages/MediaManager';
import MenuBuilder from './presentation/pages/MenuBuilder';
import MenusManager from './presentation/pages/MenusManager';
import PageForm from './presentation/pages/PageForm';
import PagesManager from './presentation/pages/PagesManager';
import Profile from './presentation/pages/Profile';
import RedirectsManager from './presentation/pages/RedirectsManager';
import Register from './presentation/pages/Register';
import ResetPassword from './presentation/pages/ResetPassword';
import RolesManager from './presentation/pages/RolesManager';
import SeoSettings from './presentation/pages/SeoSettings';
import SystemSettings from './presentation/pages/SystemSettings';
import TagsManager from './presentation/pages/TagsManager';
import UsersManager from './presentation/pages/UsersManager';
import { useAuthStore } from './store/auth.store';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <MainLayout>{children}</MainLayout>;
};

import React, { useEffect } from 'react';
import { useSettingsStore } from './store/settings.store';

function App() {
    const fetchSettings = useSettingsStore(state => state.fetchSettings);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Admin Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/comics" element={<ProtectedRoute><ComicsManager /></ProtectedRoute>} />
            <Route path="/comics/new" element={<ProtectedRoute><ComicForm /></ProtectedRoute>} />
            <Route path="/comics/edit/:id" element={<ProtectedRoute><ComicForm /></ProtectedRoute>} />
            <Route path="/comics/:id/chapters" element={<ProtectedRoute><ChaptersManager /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesManager /></ProtectedRoute>} />
            <Route path="/tags" element={<ProtectedRoute><TagsManager /></ProtectedRoute>} />
            <Route path="/media" element={<ProtectedRoute><MediaManager /></ProtectedRoute>} />
            <Route path="/menus" element={<ProtectedRoute><MenusManager /></ProtectedRoute>} />
            <Route path="/menus/:id" element={<ProtectedRoute><MenuBuilder /></ProtectedRoute>} />
            <Route path="/seo" element={<ProtectedRoute><SeoSettings /></ProtectedRoute>} />
            <Route path="/layout" element={<ProtectedRoute><LayoutSettings /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersManager /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><RolesManager /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* New Pages & Layout Routes */}
            <Route path="/pages" element={<ProtectedRoute><PagesManager /></ProtectedRoute>} />
            <Route path="/pages/create" element={<ProtectedRoute><PageForm /></ProtectedRoute>} />
            <Route path="/pages/edit/:id" element={<ProtectedRoute><PageForm /></ProtectedRoute>} />
            <Route path="/seo/redirects" element={<ProtectedRoute><RedirectsManager /></ProtectedRoute>} />
            <Route path="/layout/header" element={<ProtectedRoute><HeaderBuilder /></ProtectedRoute>} />
            <Route path="/layout/footer" element={<ProtectedRoute><FooterBuilder /></ProtectedRoute>} />
        </Routes>
    );
}

export default App;
