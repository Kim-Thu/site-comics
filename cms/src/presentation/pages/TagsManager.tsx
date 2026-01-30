import { Edit2, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { comicService } from '../../infrastructure/api.service';

const TagsManager = () => {
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const data = await comicService.getTags();
            setTags(data);
        } catch (error) {
            toast.error('Failed to load tags');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await comicService.updateTag(editingId, formData);
                toast.success('Tag updated successfully');
            } else {
                await comicService.createTag(formData);
                toast.success('Tag created successfully');
            }
            setShowModal(false);
            fetchTags();
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this tag?')) return;
        try {
            await comicService.deleteTag(id);
            toast.success('Tag deleted');
            fetchTags();
        } catch (error) {
            toast.error('Failed to delete tag');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', slug: '' });
    };

    const openEditModal = (tag: any) => {
        setEditingId(tag.id);
        setFormData({
            name: tag.name,
            slug: tag.slug
        });
        setShowModal(true);
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in font-inter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">
                        Quản lý Tags (Nhãn)
                    </h1>
                    <p className="text-zinc-400 text-xs font-medium mt-1">
                        Quản lý các thẻ để gắn vào truyện
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all text-sm"
                >
                    <Plus size={18} />
                    <span>Thêm Tag</span>
                </button>
            </div>

            {/* Content */}
            <div className="bg-[#111114] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
                {/* Toolbar */}
                <div className="p-4 border-b border-white/5 flex gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tag..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-1/3">Tên Tag</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-1/3">Slug</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center">
                                        <Loader2 className="animate-spin mx-auto text-purple-500 mb-2" size={24} />
                                        <p className="text-zinc-500 text-xs">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : filteredTags.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-zinc-500 text-sm italic">
                                        Không tìm thấy tag nào
                                    </td>
                                </tr>
                            ) : (
                                filteredTags.map((tag) => (
                                    <tr key={tag.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors">
                                                #{tag.name}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <code className="text-xs font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                {tag.slug}
                                            </code>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(tag)}
                                                    className="p-2 hover:bg-purple-500/10 text-zinc-400 hover:text-purple-400 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tag.id)}
                                                    className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#111114] border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl animate-zoom-in">
                        <div className="px-8 py-6 border-b border-white/5">
                            <h2 className="text-xl font-bold font-outfit text-white">
                                {editingId ? 'Chỉnh sửa Tag' : 'Thêm Tag mới'}
                            </h2>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tên Tag</label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-purple-500 transition-all font-bold text-sm"
                                        placeholder="Ví dụ: #Fantasy"
                                        value={formData.name}
                                        onChange={(e) => {
                                            const name = e.target.value;
                                            const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                            setFormData({ ...formData, name, slug });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Slug</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-400 focus:outline-none focus:border-purple-500 transition-all font-mono text-sm"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-white/5 text-zinc-400 hover:bg-white/10 transition-all text-sm"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-purple-500 text-white hover:bg-purple-600 shadow-xl shadow-purple-500/20 text-sm flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagsManager;
