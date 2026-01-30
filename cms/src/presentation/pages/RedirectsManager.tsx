import { ArrowRight, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../infrastructure/api.service';
import ConfirmModal from '../components/ConfirmModal';
import CustomCheckbox from '../components/CustomCheckbox';
import CustomSelect from '../components/CustomSelect';

interface Redirect {
    id: string;
    fromPath: string;
    toPath: string;
    type: string;
    isActive: boolean;
    hits: number;
}

const RedirectsManager = () => {
    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
    const [formData, setFormData] = useState({ fromPath: '', toPath: '', type: '301', isActive: true });

    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string }>({
        show: false,
        id: ''
    });

    const redirectTypeOptions = [
        { value: '301', label: '301 (Vĩnh viễn)' },
        { value: '302', label: '302 (Tạm thời)' }
    ];

    useEffect(() => {
        fetchRedirects();
    }, []);

    const fetchRedirects = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/redirects');
            setRedirects(data);
        } catch (error) {
            toast.error('Không tải được danh sách chuyển hướng');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRedirect) {
                await api.patch(`/redirects/${editingRedirect.id}`, formData);
                toast.success('Cập nhật thành công');
            } else {
                await api.post('/redirects', formData);
                toast.success('Tạo mới thành công');
            }
            setIsModalOpen(false);
            fetchRedirects();
        } catch (error) {
            toast.error('Lưu thất bại');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/redirects/${deleteConfirm.id}`);
            setRedirects(redirects.filter(r => r.id !== deleteConfirm.id));
            toast.success('Xóa thành công');
        } catch (error) {
            toast.error('Xóa thất bại');
        } finally {
            setDeleteConfirm({ show: false, id: '' });
        }
    };

    const openEditModal = (redirect?: Redirect) => {
        if (redirect) {
            setEditingRedirect(redirect);
            setFormData({
                fromPath: redirect.fromPath,
                toPath: redirect.toPath,
                type: redirect.type,
                isActive: redirect.isActive
            });
        } else {
            setEditingRedirect(null);
            setFormData({ fromPath: '', toPath: '', type: '301', isActive: true });
        }
        setIsModalOpen(true);
    };

    const filteredRedirects = redirects.filter(r =>
        r.fromPath.includes(searchTerm) || r.toPath.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-fade-in font-inter">
            <div className="flex justify-between items-center bg-[#111114] p-4 rounded-2xl border border-white/10">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 font-outfit uppercase">Redirect Links</h1>
                    <p className="text-zinc-500 text-xs">Quản lý chuyển hướng đường dẫn (301/302 Redirects) tốt cho SEO</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm link..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => openEditModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all"
                    >
                        <Plus size={18} />
                        Thêm mới
                    </button>
                </div>
            </div>

            <div className="bg-[#111114] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5 text-left bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Đường dẫn cũ (From)</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase w-8"></th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Đường dẫn mới (To)</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase w-24">Loại</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase w-24 text-center">Hits</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase w-32 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Đang tải...</td></tr>
                        ) : filteredRedirects.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Chưa có liên kết chuyển hướng nào.</td></tr>
                        ) : (
                            filteredRedirects.map((redirect) => (
                                <tr key={redirect.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 font-mono text-sm text-zinc-300">{redirect.fromPath}</td>
                                    <td className="p-4 text-zinc-600"><ArrowRight size={16} /></td>
                                    <td className="p-4 font-mono text-sm text-indigo-400">{redirect.toPath}</td>
                                    <td className="p-4 text-xs bg-white/5 mx-4 inline-block my-2 rounded text-zinc-400 font-bold">{redirect.type}</td>
                                    <td className="p-4 text-sm text-zinc-500 text-center">{redirect.hits}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => openEditModal(redirect)} className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => setDeleteConfirm({ show: true, id: redirect.id })} className="p-2 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <form onSubmit={handleSave} className="bg-[#111114] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 animate-zoom-in">
                        <h2 className="text-xl font-bold text-white mb-6">{editingRedirect ? 'Chỉnh sửa Redirect' : 'Thêm Redirect mới'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Đường dẫn cũ (Ví dụ: /old-slug)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                                    value={formData.fromPath}
                                    onChange={e => setFormData({ ...formData, fromPath: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Đường dẫn mới (Ví dụ: /new-comic-slug)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                                    value={formData.toPath}
                                    onChange={e => setFormData({ ...formData, toPath: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <CustomSelect
                                        label="Loại Redirect"
                                        value={formData.type}
                                        onChange={(val) => setFormData({ ...formData, type: val })}
                                        options={redirectTypeOptions}
                                    />
                                </div>
                                <div className="flex-1 pb-3 flex flex-col justify-end">
                                    <CustomCheckbox
                                        checked={formData.isActive}
                                        onChange={(val) => setFormData({ ...formData, isActive: val })}
                                        label="Kích hoạt"
                                        description="Link chuyển hướng sẽ có hiệu lực ngay"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 bg-white/5 text-zinc-400 rounded-xl font-bold">Hủy</button>
                            <button type="submit" className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20">Lưu thay đổi</button>
                        </div>
                    </form>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, id: '' })}
                onConfirm={handleDelete}
                title="Xóa chuyển hướng"
                message="Bạn có chắc muốn xóa liên kết chuyển hướng này? Hành động này có thể ảnh hưởng đến SEO nếu link cũ vẫn còn được Google index."
                confirmText="Xác nhận xóa"
                type="danger"
            />
        </div>
    );
};

export default RedirectsManager;
