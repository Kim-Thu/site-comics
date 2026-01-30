import {
    BookOpen,
    ChevronDown,
    Image,
    LayoutDashboard,
    List,
    LogOut,
    Menu,
    Palette,
    Search,
    Settings,
    Shield,
    Tag,
    User,
    Users
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const Sidebar = () => {
    const logout = useAuthStore(state => state.logout);
    const [expanded, setExpanded] = useState<string[]>(['comics']); // Default expand comics section

    const toggleExpand = (key: string) => {
        setExpanded(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Tổng quan', path: '/', key: 'dashboard' },
        {
            icon: <BookOpen size={20} />,
            label: 'Quản lý truyện',
            path: '/comics',
            key: 'comics',
            children: [
                { icon: <List size={18} />, label: 'Danh sách truyện', path: '/comics' },
                { icon: <List size={18} />, label: 'Thể loại', path: '/categories' },
                { icon: <Tag size={18} />, label: 'Tags (Nhãn)', path: '/tags' }
            ]
        },
        {
            icon: <BookOpen size={20} />,
            label: 'Quản lý Trang',
            path: '/pages',
            key: 'pages'
        },
        { icon: <Image size={20} />, label: 'Thư viện ảnh', path: '/media', key: 'media' },
        { icon: <Menu size={20} />, label: 'Quản lý Menu', path: '/menus', key: 'menus' },
        {
            icon: <Users size={20} />,
            label: 'Quản trị người dùng',
            path: '/users', // Parent path mostly for key
            key: 'users-group',
            children: [
                { icon: <User size={18} />, label: 'Danh sách thành viên', path: '/users' },
                { icon: <Shield size={18} />, label: 'Vai trò & Phân quyền', path: '/roles' }
            ]
        },
        {
            icon: <Search size={20} />,
            label: 'Cấu hình SEO',
            path: '/seo',
            key: 'seo',
            children: [
                { label: 'Cấu hình chung', path: '/seo' },
                { label: 'Redirect Links', path: '/seo/redirects' }
            ]
        },
        {
            icon: <Palette size={20} />,
            label: 'Giao diện & Bố cục',
            path: '/layout',
            key: 'layout',
            children: [
                { label: 'Cấu hình chung', path: '/layout' },
                { label: 'Header Builder', path: '/layout/header' },
                { label: 'Footer Builder', path: '/layout/footer' }
            ]
        },
        { icon: <Settings size={20} />, label: 'Cài đặt hệ thống', path: '/settings', key: 'settings' },
        { icon: <User size={20} />, label: 'Hồ sơ cá nhân', path: '/profile', key: 'profile' },
    ];

    return (
        <div className="w-64 h-screen bg-white/[0.02] backdrop-blur-xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6">
                <NavLink to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        <span className="text-xl font-bold italic text-white/90 font-inter">TM</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-white font-outfit leading-none">
                            Truyen<span className="text-indigo-500">Moi</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">CMS Panel</span>
                    </div>
                </NavLink>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
                {menuItems.map((item) => (
                    <div key={item.key} className="space-y-1">
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => toggleExpand(item.key)}
                                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 ${expanded.includes(item.key) ? 'text-zinc-200 bg-white/5' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${expanded.includes(item.key) ? 'rotate-180' : ''}`} />
                                </button>
                                {expanded.includes(item.key) && (
                                    <div className="pl-4 space-y-1 animate-fade-in-down">
                                        {item.children.map((child) => (
                                            <NavLink
                                                key={child.path}
                                                to={child.path}
                                                end
                                                className={({ isActive }) => `
                                                    flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm border-l-2 ml-4
                                                    ${isActive
                                                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500'
                                                        : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                                                `}
                                            >
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}
                                `}
                            >
                                {item.icon}
                                <span className="font-medium text-sm">{item.label}</span>
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => {
                        logout();
                        toast.success('Hẹn gặp lại!');
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-colors bg-transparent border-none"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
