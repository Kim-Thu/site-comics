import { Lock, Search, Shield, ShieldOff, User, UserCheck, UserX } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { userService } from '../../infrastructure/api.service';
import { useRoleStore } from '../../store/role.store';
import ConfirmModal from '../components/ConfirmModal';
import CustomSelect from '../components/CustomSelect';

interface ActivityLog {
    id: string;
    action: string;
    createdAt: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    avatar: string;
    role: string; // fallback enum
    userRole?: {
        id: string;
        name: string;
    };
    status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
    createdAt: string;
    activityLogs: ActivityLog[];
}

const UsersManager = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    // Modal States
    const [resettingId, setResettingId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');

    // Confirmation
    const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; action: () => Promise<void>; isDanger?: boolean }>({
        open: false, title: '', message: '', action: async () => { }, isDanger: false
    });

    // Role Selection
    const { roles, fetchRoles } = useRoleStore();
    const [roleModal, setRoleModal] = useState<{ open: boolean; userId: string; currentRoleId?: string }>({ open: false, userId: '' });
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [roleSearch, setRoleSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    useEffect(() => {
        if (roleModal.open) fetchRoles();
    }, [roleModal.open]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await userService.getUsers({ page, limit: 10, search });
            setUsers(res.data);
        } catch (error) {
            toast.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (user: User) => {
        if (user.userRole?.name) return user.userRole.name;
        // Fallback for legacy enum roles
        if (user.role === 'ADMIN') return 'Quản trị viên (Cũ)';
        if (user.role === 'USER') return 'Thành viên';
        return user.role;
    };

    const handleConfirmAction = async () => {
        try {
            await confirmState.action();
            setConfirmState({ ...confirmState, open: false });
        } catch (error) {
            // Error managed in action
        }
    };

    const handleStatusChange = (id: string, status: string) => {
        setConfirmState({
            open: true,
            title: `Cập nhật trạng thái`,
            message: `Bạn có chắc chắn muốn chuyển trạng thái thành ${status === 'BANNED' ? 'BỊ CẤM' : 'HOẠT ĐỘNG'}?`,
            isDanger: status === 'BANNED',
            action: async () => {
                await userService.updateStatus(id, status);
                toast.success('Đã cập nhật trạng thái');
                await fetchUsers();
            }
        });
    };

    const openRoleModal = (user: User) => {
        setRoleModal({ open: true, userId: user.id, currentRoleId: user.userRole?.id });
        setSelectedRoleId(user.userRole?.id || '');
        setRoleSearch('');
    };

    const handleSaveRole = async () => {
        if (!selectedRoleId) return;
        try {
            // Send roleId if updating dynamic role
            await userService.updateRole(roleModal.userId, { roleId: selectedRoleId });
            toast.success('Đã cập nhật vai trò');
            setRoleModal({ ...roleModal, open: false });
            fetchUsers();
        } catch (error) {
            toast.error('Lỗi khi cập nhật vai trò');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.resetPassword(resettingId!, newPassword);
            toast.success('Đổi mật khẩu thành công');
            setResettingId(null);
            setNewPassword('');
        } catch (error) {
            toast.error('Lỗi khi đổi mật khẩu');
        }
    };

    // Filter roles
    const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));

    // Filter Roles
    const [filterType, setFilterType] = useState<'ALL' | 'STAFF' | 'USER'>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'BANNED'>('ALL');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const filteredUsers = users.filter(user => {
        // Filter by Role Type
        if (filterType === 'STAFF') {
            if (user.role !== 'ADMIN' && !user.userRole) return false;
        }
        if (filterType === 'USER') {
            if (user.role === 'ADMIN' || !!user.userRole) return false;
        }

        // Filter by Status
        if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;

        return true;
    }).sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return (
        <div className="space-y-6 pb-20 font-inter">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-outfit uppercase tracking-tight">Thành Viên</h1>
                    <p className="text-zinc-500 text-sm">Quản lý người dùng và trạng thái hoạt động.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Role Filter */}
                    <div className="flex bg-[#111114] p-1 rounded-xl border border-white/10 h-10 items-center">
                        <button
                            onClick={() => setFilterType('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'ALL' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilterType('STAFF')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'STAFF' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Nhân sự
                        </button>
                        <button
                            onClick={() => setFilterType('USER')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'USER' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Độc giả
                        </button>
                    </div>

                    {/* Status Filter */}
                    <CustomSelect
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val as any)}
                        options={[
                            { value: 'ALL', label: 'Mọi trạng thái' },
                            { value: 'ACTIVE', label: 'Đang hoạt động' },
                            { value: 'INACTIVE', label: 'Không hoạt động' },
                            { value: 'BANNED', label: 'Đã bị cấm' }
                        ]}
                    />

                    {/* Sort */}
                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="bg-[#111114] border border-white/10 rounded-xl px-4 h-10 flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                    >
                        {sortOrder === 'desc' ? <UserCheck size={14} className="rotate-180" /> : <UserCheck size={14} />}
                        {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full bg-[#111114] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#111114] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/[0.08] text-left">
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Thành viên</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Vai trò</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Hoạt động gần nhất</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Đang tải...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Không tìm thấy thành viên nào</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-zinc-500" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-200">{user.name || 'No Name'}</div>
                                                <div className="text-xs text-zinc-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => openRoleModal(user)}
                                            className="bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 mx-auto"
                                        >
                                            {getRoleLabel(user)}
                                            <Shield size={12} className="text-indigo-400" />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            user.status === 'BANNED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                            }`}>
                                            {user.status === 'ACTIVE' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>}
                                            {user.status === 'ACTIVE' ? 'Đang hoạt động' : user.status === 'BANNED' ? 'Đã cấm' : 'Không hoạt động'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-zinc-400">
                                            {user.activityLogs?.[0] ? (
                                                <>
                                                    <span className="font-mono text-indigo-400 font-bold">{user.activityLogs[0].action}</span>
                                                    <div className="text-[10px] text-zinc-600 mt-0.5">{new Date(user.activityLogs[0].createdAt).toLocaleString('vi-VN')}</div>
                                                </>
                                            ) : (
                                                <span className="text-zinc-600 italic">Chưa có hoạt động</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setResettingId(user.id)}
                                                className="p-2 hover:bg-indigo-500/20 text-zinc-400 hover:text-indigo-400 rounded-lg transition-colors"
                                                title="Đổi mật khẩu"
                                            >
                                                <Lock size={16} />
                                            </button>
                                            {user.status === 'BANNED' ? (
                                                <button
                                                    onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                                    className="p-2 hover:bg-green-500/20 text-zinc-400 hover:text-green-400 rounded-lg transition-colors"
                                                    title="Mở khóa"
                                                >
                                                    <UserCheck size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusChange(user.id, 'BANNED')}
                                                    className="p-2 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                                                    title="Cấm thành viên"
                                                >
                                                    <UserX size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Simplified) */}
            <div className="flex justify-center gap-2 mt-4">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-zinc-800 rounded-lg disabled:opacity-50 text-sm">Trước</button>
                <span className="px-4 py-2 text-zinc-400 text-sm">Trang {page}</span>
                <button disabled={users.length < 10} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-zinc-800 rounded-lg disabled:opacity-50 text-sm">Sau</button>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={handleConfirmAction}
                onClose={() => setConfirmState({ ...confirmState, open: false })}
                type={confirmState.isDanger ? 'danger' : 'info'}
            />

            {/* Role Selection Modal */}
            {roleModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[#111114] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">Phân quyền thành viên</h3>
                            <p className="text-zinc-500 text-sm mt-1">Chọn vai trò cho thành viên này.</p>
                        </div>

                        <div className="p-4 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm vai trò..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 focus:border-indigo-500 outline-none"
                                    value={roleSearch}
                                    onChange={(e) => setRoleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-2 min-h-[150px]">
                            {roles.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShieldOff size={40} className="mx-auto text-zinc-600 mb-3" />
                                    <p className="text-zinc-400 text-sm mb-4">Chưa có vai trò nào được tạo.</p>
                                    <Link to="/roles" onClick={() => setRoleModal({ ...roleModal, open: false })} className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm">
                                        <Shield size={16} />
                                        Quản lý vai trò
                                    </Link>
                                </div>
                            ) : filteredRoles.length === 0 ? (
                                <div className="text-center py-8 text-zinc-500">
                                    Không tìm thấy vai trò phù hợp
                                </div>
                            ) : (
                                filteredRoles.map(role => (
                                    <label
                                        key={role.id}
                                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all group ${selectedRoleId === role.id
                                            ? 'bg-indigo-500/10 border-indigo-500/50'
                                            : 'bg-white/5 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="mt-1">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRoleId === role.id ? 'border-indigo-500' : 'border-zinc-600'
                                                }`}>
                                                {selectedRoleId === role.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="role"
                                                className="hidden"
                                                checked={selectedRoleId === role.id}
                                                onChange={() => setSelectedRoleId(role.id)}
                                            />
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm ${selectedRoleId === role.id ? 'text-indigo-400' : 'text-zinc-200'}`}>
                                                {role.name}
                                            </div>
                                            {role.description && (
                                                <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{role.description}</div>
                                            )}
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02] rounded-b-2xl">
                            <button
                                onClick={() => setRoleModal({ ...roleModal, open: false })}
                                className="px-4 py-2 text-zinc-400 font-bold hover:text-white text-sm"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSaveRole}
                                disabled={!selectedRoleId}
                                className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-500/20"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resettingId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <form onSubmit={handleResetPassword} className="bg-[#111114] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-4">Đổi mật khẩu</h3>
                        <input
                            type="password"
                            autoFocus
                            placeholder="Nhập mật khẩu mới..."
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none mb-6"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setResettingId(null)} className="px-4 py-2 text-zinc-400 font-bold hover:text-white">Hủy</button>
                            <button type="submit" disabled={!newPassword} className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 disabled:opacity-50 transition-all">Lưu</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UsersManager;
