import { ArrowRight, Edit2, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../infrastructure/api.service';
import CustomCheckbox from '../components/atoms/CustomCheckbox';
import CustomSelect from '../components/atoms/CustomSelect';
import PageHeader from '../components/atoms/PageHeader';
import SearchInput from '../components/atoms/SearchInput';
import ConfirmModal from '../components/ConfirmModal';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../components/Table';

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
            <PageHeader
                title="Redirect Links"
                description="Quản lý chuyển hướng đường dẫn (301/302 Redirects) tốt cho SEO"
            >
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Tìm kiếm link..."
                    className="w-64"
                />
                <button
                    onClick={() => openEditModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all"
                >
                    <Plus size={18} />
                    Thêm mới
                </button>
            </PageHeader>

            <TableContainer>
                <TableHeader>
                    <TableHead>Đường dẫn cũ (From)</TableHead>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Đường dẫn mới (To)</TableHead>
                    <TableHead className="w-24">Loại</TableHead>
                    <TableHead align="center" className="w-24">Hits</TableHead>
                    <TableHead align="right" className="w-32">Thao tác</TableHead>
                </TableHeader>
                <TableBody loading={loading} isEmpty={filteredRedirects.length === 0} emptyMessage="Chưa có liên kết chuyển hướng nào." colSpan={6}>
                    {filteredRedirects.map((redirect) => (
                        <TableRow key={redirect.id}>
                            <TableCell>
                                <code className="font-mono text-sm text-zinc-300">{redirect.fromPath}</code>
                            </TableCell>
                            <TableCell>
                                <ArrowRight size={16} className="text-zinc-600" />
                            </TableCell>
                            <TableCell>
                                <code className="font-mono text-sm text-indigo-400">{redirect.toPath}</code>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs bg-white/5 px-2 py-1 rounded text-zinc-400 font-bold">{redirect.type}</span>
                            </TableCell>
                            <TableCell align="center">
                                <span className="text-sm text-zinc-500">{redirect.hits}</span>
                            </TableCell>
                            <TableCell align="right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => openEditModal(redirect)} className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => setDeleteConfirm({ show: true, id: redirect.id })} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>

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
