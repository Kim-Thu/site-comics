import axios from 'axios';
import { Camera, Key, Save, Shield, User, UserCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../infrastructure/api.service';
import { useAuthStore } from '../../store/auth.store';

const Profile = () => {
    const { user, token, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Extended profile data
    const [profile, setProfile] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            setProfile(res.data);
            setFormData(prev => ({
                ...prev,
                name: res.data.name || '',
                email: res.data.email || ''
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            // Note: Adjust upload endpoint as needed per your backend
            const res = await axios.post('http://localhost:3001/upload/image', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            // Update avatar URL in backend
            await api.patch(`/users/${user?.id}`, { avatar: res.data.url });

            updateUser({ avatar: res.data.url });
            setProfile({ ...profile, avatar: res.data.url });
            toast.success('Cập nhật ảnh đại diện thành công');
        } catch (error) {
            toast.error('Tải ảnh lên thất bại (API Upload chưa cấu hình?)');
        }
    };

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/users/${user?.id}`, { name: formData.name });
            updateUser({ name: formData.name });
            toast.success('Đã cập nhật thông tin cá nhân');
        } catch (error) {
            toast.error('Lỗi khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('Mật khẩu xác nhận không khớp');
        }
        if (!formData.newPassword) return;

        try {
            // Call change password endpoint (assuming one exists or using update with check)
            // For now using update, backend typically handles password hashing
            await api.patch(`/users/${user?.id}`, { password: formData.newPassword });
            toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '', currentPassword: '' }));
        } catch (error) {
            toast.error('Lỗi khi đổi mật khẩu');
        }
    };

    const getRoleName = () => {
        if (profile?.userRole?.name) return profile.userRole.name;
        if (profile?.role === 'ADMIN') return 'Quản trị viên (Super)';
        return 'Thành viên';
    };

    if (fetching) return <div className="p-8 text-center text-zinc-500">Đang tải hồ sơ...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 font-inter pb-20">
            <div>
                <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-outfit uppercase tracking-tight">Hồ sơ cá nhân</h1>
                <p className="text-zinc-500 text-sm">Quản lý thông tin tài khoản và bảo mật của bạn.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Avatar & Overview */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500/20 to-purple-500/20"></div>
                        <div className="relative flex flex-col items-center">
                            <div className="w-28 h-28 rounded-full border-4 border-[#111114] shadow-xl overflow-hidden relative mb-4 bg-zinc-800 flex items-center justify-center">
                                {profile?.avatar ? (
                                    <img src={profile.avatar} className="w-full h-full object-cover" alt="Avatar" />
                                ) : (
                                    <UserCircle size={64} className="text-zinc-600" />
                                )}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera size={24} className="text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{profile?.name}</h2>
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
                                {getRoleName()}
                            </span>
                        </div>

                        <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Email</span>
                                <span className="text-zinc-300 font-medium">{profile?.email}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Tham gia</span>
                                <span className="text-zinc-300 font-medium">{new Date(profile?.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Trạng thái</span>
                                <span className="text-green-400 font-bold">Hoạt động</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Basic Info */}
                    <form onSubmit={handleSaveInfo} className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Thông tin cơ bản</h3>
                                <p className="text-xs text-zinc-500">Cập nhật tên hiển thị của bạn</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Họ và tên</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed font-medium"
                                    value={formData.email}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button disabled={loading} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2">
                                <Save size={18} /> Lưu thay đổi
                            </button>
                        </div>
                    </form>

                    {/* Security */}
                    <form onSubmit={handleChangePassword} className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Bảo mật</h3>
                                <p className="text-xs text-zinc-500">Đổi mật khẩu đăng nhập</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={!formData.newPassword} className="px-6 py-2 bg-zinc-800 hover:bg-red-500 hover:text-white text-zinc-400 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
                                <Key size={18} /> Đổi mật khẩu
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
