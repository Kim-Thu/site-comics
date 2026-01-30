import { Bell, ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { settingService } from '../../infrastructure/api.service';
import { useAuthStore } from '../../store/auth.store';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuthStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        loadSettings();

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await settingService.getSettings();
            if (settings && settings.accentColor) {
                setBrandColors(settings.accentColor);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const setBrandColors = (hex: string) => {
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        const rgb = hexToRgb(hex);
        if (!rgb) return;

        const { r, g, b } = rgb;

        // Darker (approx 20%)
        const dr = Math.max(0, Math.floor(r * 0.8));
        const dg = Math.max(0, Math.floor(g * 0.8));
        const db = Math.max(0, Math.floor(b * 0.8));

        // Lighter (approx 20%)
        const lr = Math.min(255, Math.floor(r * 1.2));
        const lg = Math.min(255, Math.floor(g * 1.2));
        const lb = Math.min(255, Math.floor(b * 1.2));

        // Convert back to hex
        const toHex = (n: number) => n.toString(16).padStart(2, '0');

        const root = document.documentElement;
        root.style.setProperty('--primary', hex);
        root.style.setProperty('--primary-dark', `#${toHex(dr)}${toHex(dg)}${toHex(db)}`);
        root.style.setProperty('--primary-light', `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`);
    };

    const handleLogout = () => {
        logout();
        toast.success('Hẹn gặp lại!');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-[#070708] font-inter">
            <Sidebar />
            <div className="flex-1 ml-64">
                <header className="h-16 border-b border-white/5 bg-[#0a0a0c]/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 uppercase tracking-widest">
                        Hệ thống quản trị <span className="text-zinc-700">/</span> TruyenMoi
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative text-zinc-400 hover:text-white transition-colors bg-transparent border-none">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
                        </button>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pl-6 border-l border-white/5 bg-transparent border-none group cursor-pointer"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors">{user?.name || 'Admin User'}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-tight">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold uppercase overflow-hidden shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
                                    {user?.avatar ? (
                                        <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        user?.name?.charAt(0) || 'A'
                                    )}
                                </div>
                                <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-[#111114] border border-white/10 rounded-2xl shadow-2xl py-2 animate-fade-in animate-zoom-in overflow-hidden z-[100] backdrop-blur-xl">
                                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Tài khoản</p>
                                        <p className="text-sm font-medium text-zinc-200 truncate">{user?.email}</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <UserIcon size={18} className="text-indigo-500" />
                                        Hồ sơ cá nhân
                                    </Link>

                                    <Link
                                        to="/settings"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <Settings size={18} className="text-indigo-500" />
                                        Cài đặt hệ thống
                                    </Link>

                                    <div className="h-px bg-white/5 my-1" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/5 transition-all bg-transparent border-none"
                                    >
                                        <LogOut size={18} />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="p-12 lg:px-20 lg:py-16">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
