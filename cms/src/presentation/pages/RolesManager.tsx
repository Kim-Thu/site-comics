import { Check, Edit, Plus, ShieldCheck, Trash, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRoleStore } from '../../store/role.store';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';

const PERMISSIONS_LIST = [
    {
        group: 'Truyện tranh', items: [
            { id: 'comic:view', label: 'Xem danh sách' },
            { id: 'comic:create', label: 'Thêm mới' },
            { id: 'comic:update', label: 'Chỉnh sửa' },
            { id: 'comic:delete', label: 'Xóa' },
            { id: 'comic:bulk-delete', label: 'Xóa hàng loạt' }
        ]
    },
    {
        group: 'Chương truyện', items: [
            { id: 'chapter:view', label: 'Xem danh sách' },
            { id: 'chapter:create', label: 'Thêm chương mới' },
            { id: 'chapter:update', label: 'Chỉnh sửa chương' },
            { id: 'chapter:delete', label: 'Xóa chương' },
            { id: 'chapter:bulk-delete', label: 'Xóa hàng loạt' }
        ]
    },
    {
        group: 'Danh mục & Thẻ', items: [
            { id: 'category:view', label: 'Xem thể loại' },
            { id: 'category:create', label: 'Tạo thể loại' },
            { id: 'category:update', label: 'Sửa thể loại' },
            { id: 'category:delete', label: 'Xóa thể loại' },
            { id: 'category:bulk-delete', label: 'Xóa hàng loạt' },
            { id: 'tag:view', label: 'Xem tags' },
            { id: 'tag:create', label: 'Tạo tag' },
            { id: 'tag:update', label: 'Sửa tag' },
            { id: 'tag:delete', label: 'Xóa tag' },
            { id: 'tag:bulk-delete', label: 'Xóa tags hàng loạt' }
        ]
    },
    {
        group: 'Thư viện Media', items: [
            { id: 'media:view', label: 'Xem thư viện' },
            { id: 'media:upload', label: 'Tải ảnh lên' },
            { id: 'media:update', label: 'Chỉnh sửa thông tin' },
            { id: 'media:delete', label: 'Xóa ảnh' },
            { id: 'media:bulk-delete', label: 'Xóa hàng loạt' },
            { id: 'media:bulk-select', label: 'Chọn nhiều ảnh' }
        ]
    },
    {
        group: 'Menu & Navigation', items: [
            { id: 'menu:view', label: 'Xem menu' },
            { id: 'menu:create', label: 'Tạo menu' },
            { id: 'menu:update', label: 'Chỉnh sửa menu' },
            { id: 'menu:delete', label: 'Xóa menu' },
            { id: 'menu:build', label: 'Menu Builder' },
            { id: 'menu:nested', label: 'Tạo submenu' }
        ]
    },
    {
        group: 'Thành viên', items: [
            { id: 'user:view', label: 'Xem danh sách' },
            { id: 'user:create', label: 'Tạo user' },
            { id: 'user:update', label: 'Chỉnh sửa user' },
            { id: 'user:delete', label: 'Xóa user' },
            { id: 'user:ban', label: 'Ban/Unban user' },
            { id: 'role:view', label: 'Xem phân quyền' },
            { id: 'role:manage', label: 'Quản lý Phân quyền' }
        ]
    },
    {
        group: 'Hệ thống', items: [
            { id: 'system:settings', label: 'Cấu hình chung' },
            { id: 'seo:manage', label: 'Cấu hình SEO' },
            { id: 'system:backup', label: 'Sao lưu dữ liệu' },
            { id: 'system:logs', label: 'Xem logs hệ thống' }
        ]
    }
];

const RolesManager = () => {
    const { roles, loading, fetchRoles, createRole, updateRole, deleteRole } = useRoleStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] as string[] });
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
        show: false,
        id: '',
        name: ''
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenModal = (role?: any) => {
        const allPermissions = PERMISSIONS_LIST.flatMap(group => group.items.map(item => item.id));
        if (role) {
            setEditingRole(role);
            const isAdmin = role.name.toLowerCase() === 'admin';
            setFormData({
                name: role.name,
                description: role.description || '',
                permissions: isAdmin ? allPermissions : (role.permissions || [])
            });
        } else {
            setEditingRole(null);
            setFormData({ name: '', description: '', permissions: [] });
        }
        setIsModalOpen(true);
    };

    const handleTogglePermission = (id: string) => {
        if (formData.name.toLowerCase() === 'admin') return; // Cannot toggle permissions for Admin

        setFormData(prev => {
            const exists = prev.permissions.includes(id);
            if (exists) {
                return { ...prev, permissions: prev.permissions.filter(p => p !== id) };
            } else {
                return { ...prev, permissions: [...prev.permissions, id] };
            }
        });
    };

    const handleSelectAll = () => {
        if (formData.name.toLowerCase() === 'admin') return;

        const allPermissions = PERMISSIONS_LIST.flatMap(group => group.items.map(item => item.id));
        if (formData.permissions.length === allPermissions.length) {
            setFormData(prev => ({ ...prev, permissions: [] }));
        } else {
            setFormData(prev => ({ ...prev, permissions: allPermissions }));
        }
    };

    const handleNameChange = (name: string) => {
        const isAdmin = name.toLowerCase() === 'admin';
        const allPermissions = PERMISSIONS_LIST.flatMap(group => group.items.map(item => item.id));

        setFormData(prev => ({
            ...prev,
            name,
            permissions: isAdmin ? allPermissions : prev.permissions
        }));

        if (isAdmin) {
            toast.success('Admin mặc định có tất cả quyền');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return toast.error('Vui lòng nhập tên vai trò');

        try {
            if (editingRole) {
                await updateRole(editingRole.id, formData);
            } else {
                await createRole(formData);
            }
            setIsModalOpen(false);
        } catch (error) {
            // Toast handled in store
        }
    };

    const handleDelete = async () => {
        try {
            await deleteRole(deleteConfirm.id);
            toast.success('Đã xóa vai trò');
        } catch (error) {
            toast.error('Xóa vai trò thất bại');
        }
    };

    return (
        <div className="space-y-6 pb-20 font-inter">
            <PageHeader
                title="Quản lý Phân quyền"
                description="Tạo và quản lý các vai trò, quyền hạn truy cập hệ thống."
            >
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm"
                >
                    <Plus size={18} />
                    <span>Thêm vai trò</span>
                </button>
            </PageHeader>

            {/* Roles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-zinc-500">Đang tải...</div>
                ) : roles.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-zinc-500">Chưa có vai trò nào được tạo.</div>
                ) : (
                    roles.map((role) => (
                        <div key={role.id} className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 hover:border-indigo-500/30 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(role)}
                                        className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm({ show: true, id: role.id, name: role.name })}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{role.name}</h3>
                            <p className="text-sm text-zinc-500 mb-6 min-h-[40px]">{role.description || 'Không có mô tả'}</p>

                            <div className="space-y-3 border-t border-white/5 pt-4">
                                <div className="text-xs font-bold text-zinc-500 uppercase">Quyền hạn ({role.permissions.length})</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {role.permissions.slice(0, 5).map((perm: string) => (
                                        <span key={perm} className="text-[10px] px-2 py-1 bg-white/5 border border-white/5 rounded text-zinc-400">
                                            {perm}
                                        </span>
                                    ))}
                                    {role.permissions.length > 5 && (
                                        <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/5 rounded text-zinc-500">
                                            +{role.permissions.length - 5}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[#111114] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="text-xl font-bold text-white font-outfit">
                                {editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Tên vai trò <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                                        placeholder="VD: Quản trị viên, Biên tập viên..."
                                        value={formData.name}
                                        onChange={e => handleNameChange(e.target.value)}
                                    />
                                    <p className="text-xs text-zinc-600 mt-1.5">💡 Nhập "Admin" để tự động chọn tất cả quyền</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Mô tả</label>
                                    <textarea
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all resize-none min-h-[80px]"
                                        placeholder="Mô tả ngắn về vai trò này..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Phân quyền chi tiết</label>
                                    <button
                                        type="button"
                                        onClick={handleSelectAll}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        <Check size={14} />
                                        {formData.permissions.length === PERMISSIONS_LIST.flatMap(g => g.items).length
                                            ? 'Bỏ chọn tất cả'
                                            : 'Chọn tất cả'}
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {PERMISSIONS_LIST.map((group) => (
                                        <div key={group.group} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                                            <h4 className="font-bold text-zinc-300 mb-3 text-sm border-b border-white/5 pb-2">{group.group}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {group.items.map((perm) => (
                                                    <label key={perm.id} className="flex items-center gap-3 cursor-pointer group/item select-none">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.permissions.includes(perm.id)
                                                            ? 'bg-indigo-500 border-indigo-500 text-white'
                                                            : 'border-white/20 bg-white/5 group-hover/item:border-indigo-500/50'
                                                            }`}>
                                                            {formData.permissions.includes(perm.id) && <Check size={14} strokeWidth={3} />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={formData.permissions.includes(perm.id)}
                                                            onChange={() => handleTogglePermission(perm.id)}
                                                        />
                                                        <span className={`text-sm ${formData.permissions.includes(perm.id) ? 'text-white' : 'text-zinc-500'}`}>
                                                            {perm.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-2.5 rounded-xl font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95"
                            >
                                {editingRole ? 'Lưu thay đổi' : 'Tạo vai trò'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, id: '', name: '' })}
                onConfirm={handleDelete}
                title="Xác nhận xóa vai trò"
                message={`Bạn có chắc muốn xóa vai trò "${deleteConfirm.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa vai trò"
                type="danger"
            />
        </div>
    );
};

export default RolesManager;
