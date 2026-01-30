import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { api } from '../../infrastructure/api.service';
import ConfirmModal from '../components/ConfirmModal';
import InputModal from '../components/InputModal';

interface Menu {
    id: string;
    name: string;
    locations: string[];
    isActive: boolean;
    createdAt: string;
}

const MenusManager = () => {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
        show: false,
        id: '',
        name: ''
    });

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/menus');
            setMenus(data);
        } catch (error) {
            toast.error('Không tải được danh sách menu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (name: string) => {
        try {
            await api.post('/menus', { name, locations: [] });
            toast.success('Tạo thành công');
            fetchMenus();
        } catch (error) {
            toast.error('Tạo thất bại');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/menus/${deleteConfirm.id}`);
            setMenus(menus.filter(m => m.id !== deleteConfirm.id));
            toast.success('Đã xóa menu');
        } catch (error) {
            toast.error('Xóa thất bại');
        }
    };

    return (
        <div className="space-y-6 font-inter pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-outfit uppercase tracking-tight">Giao diện Menu</h1>
                    <p className="text-zinc-500 text-sm">Quản lý các menu và vị trí hiển thị trên website.</p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={18} />
                    Tạo Menu mới
                </button>
            </div>

            <div className="bg-[#111114] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Tên Menu</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Vị trí</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menus.map((menu) => (
                            <tr key={menu.id} className="border-b border-white/5 last:border-none hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">
                                    <div className="text-sm font-bold text-zinc-200">{menu.name}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {menu.locations.length > 0 ? menu.locations.map(loc => (
                                            <span key={loc} className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 text-xs font-medium border border-white/5">
                                                {loc}
                                            </span>
                                        )) : <span className="text-zinc-600 text-xs italic">Chưa gán vị trí</span>}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            to={`/menus/${menu.id}`}
                                            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                            title="Sửa cấu trúc"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteConfirm({ show: true, id: menu.id, name: menu.name })}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {menus.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-zinc-500 text-sm">Chưa có menu nào. Hãy tạo mới.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            <InputModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreate}
                title="Tạo Menu mới"
                label="Tên Menu"
                placeholder="Ví dụ: Header Menu, Footer Menu..."
                submitText="Tạo Menu"
            />

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, id: '', name: '' })}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa menu "${deleteConfirm.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa Menu"
                type="danger"
            />
        </div>
    );
};

export default MenusManager;
