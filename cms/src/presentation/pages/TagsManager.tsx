import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tagService } from '../../infrastructure/api.service';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../components/Table';

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
            const data = await tagService.getTags();
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
                await tagService.updateTag(editingId, formData);
                toast.success('Tag updated successfully');
            } else {
                await tagService.createTag(formData);
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
            await tagService.deleteTag(id);
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
            <PageHeader
                title="Quản lý Tags (Nhãn)"
                description="Quản lý các thẻ để gắn vào truyện"
            >
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all text-sm"
                >
                    <Plus size={18} />
                    <span>Thêm Tag</span>
                </button>
            </PageHeader>

            {/* Content */}
            <div className="bg-[#111114] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
                {/* Toolbar */}
                <div className="p-4 border-b border-white/5 flex gap-4">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Tìm kiếm tag..."
                    />
                </div>

                {/* Table */}
                <TableContainer>
                    <TableHeader>
                        <TableHead className="w-1/3">Tên Tag</TableHead>
                        <TableHead className="w-1/3">Slug</TableHead>
                        <TableHead align="right">Thao tác</TableHead>
                    </TableHeader>
                    <TableBody loading={loading} isEmpty={filteredTags.length === 0} emptyMessage="Không tìm thấy tag nào" colSpan={3}>
                        {filteredTags.map((tag) => (
                            <TableRow key={tag.id}>
                                <TableCell>
                                    <div className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors">
                                        #{tag.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="text-xs font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                        {tag.slug}
                                    </code>
                                </TableCell>
                                <TableCell align="right">
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </TableContainer>
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
