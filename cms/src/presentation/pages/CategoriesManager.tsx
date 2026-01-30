import { Check, Edit2, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { comicService } from '../../infrastructure/api.service';
import Accordion from '../components/Accordion';
import ConfirmModal from '../components/ConfirmModal';
import CustomSelect from '../components/CustomSelect';

const CategoriesManager = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Multi-select
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parentId: ''
    });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; ids?: string[] }>({
        show: false,
        id: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await comicService.getCategories();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await comicService.updateCategory(editingId, formData);
                toast.success('Category updated successfully');
            } else {
                await comicService.createCategory(formData);
                toast.success('Category created successfully');
            }
            setShowModal(false);
            fetchCategories();
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            if (deleteConfirm.ids && deleteConfirm.ids.length > 0) {
                await Promise.all(deleteConfirm.ids.map(id => comicService.deleteCategory(id)));
                setCategories(categories.filter(c => !deleteConfirm.ids!.includes(c.id)));
                setSelectedIds(new Set());
                toast.success(`Deleted ${deleteConfirm.ids.length} categories`);
            } else {
                await comicService.deleteCategory(deleteConfirm.id);
                toast.success('Category deleted');
                fetchCategories();
            }
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', slug: '', parentId: '' });
    };

    const openEditModal = (category: any) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            slug: category.slug,
            parentId: category.parentId || ''
        });
        setShowModal(true);
    };

    const handleRowClick = (cat: any, index: number, e: React.MouseEvent) => {
        if (e.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const newSelected = new Set(selectedIds);
            for (let i = start; i <= end; i++) {
                newSelected.add(filteredCategories[i].id);
            }
            setSelectedIds(newSelected);
        } else if (e.ctrlKey || e.metaKey) {
            const newSelected = new Set(selectedIds);
            if (newSelected.has(cat.id)) {
                newSelected.delete(cat.id);
            } else {
                newSelected.add(cat.id);
            }
            setSelectedIds(newSelected);
            setLastSelectedIndex(index);
        } else {
            setSelectedIds(new Set());
            setLastSelectedIndex(null);
        }
    };

    const selectAll = () => {
        if (selectedIds.size === filteredCategories.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredCategories.map(c => c.id)));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setDeleteConfirm({ show: true, id: '', ids: Array.from(selectedIds) });
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by parent
    const rootCategories = filteredCategories.filter(c => !c.parentId);
    const childCategories = filteredCategories.filter(c => c.parentId);

    return (
        <div className="space-y-8 animate-fade-in font-inter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">
                        Quản lý Thể loại
                    </h1>
                    <p className="text-zinc-400 text-xs font-medium mt-1">
                        Phân loại truyện tranh theo nhóm và chủ đề
                        {selectedIds.size > 0 && (
                            <span className="ml-2 text-indigo-400 font-bold">
                                • {selectedIds.size} đã chọn
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-colors"
                        >
                            <Trash2 size={16} />
                            Xóa {selectedIds.size}
                        </button>
                    )}
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-sm"
                    >
                        <Plus size={18} />
                        <span>Thêm thể loại</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-[#111114] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
                {/* Toolbar */}
                <div className="p-4 border-b border-white/5 flex gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <input
                            type="text"
                            placeholder="Tìm kiếm thể loại..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <button
                        onClick={selectAll}
                        className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 px-3"
                    >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.size === filteredCategories.length
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-white/20'
                            }`}>
                            {selectedIds.size === filteredCategories.length && <Check size={12} className="text-white" />}
                        </div>
                        Chọn tất cả
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="animate-spin mx-auto text-indigo-500 mb-2" size={24} />
                            <p className="text-zinc-500 text-xs">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <Accordion title="Thể loại gốc" count={rootCategories.length} defaultOpen={true}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase w-12"></th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase w-1/3">Tên thể loại</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase w-1/3">Slug</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {rootCategories.map((cat, index) => {
                                        const isSelected = selectedIds.has(cat.id);
                                        return (
                                            <tr
                                                key={cat.id}
                                                onClick={(e) => handleRowClick(cat, index, e)}
                                                className={`transition-colors cursor-pointer ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'
                                                    }`}
                                            >
                                                <td className="p-4">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'
                                                        }`}>
                                                        {isSelected && <Check size={14} className="text-white" />}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-zinc-200 text-sm">
                                                        {cat.name}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <code className="text-xs font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                        {cat.slug}
                                                    </code>
                                                </td>
                                                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(cat)}
                                                            className="p-2 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400 rounded-lg transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ show: true, id: cat.id })}
                                                            className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Accordion>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#111114] border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl animate-zoom-in">
                        <div className="px-8 py-6 border-b border-white/5">
                            <h2 className="text-xl font-bold font-outfit text-white">
                                {editingId ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
                            </h2>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tên thể loại</label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                                        placeholder="Ví dụ: Hành động"
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
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-400 focus:outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                                <CustomSelect
                                    label="Danh mục cha (Không bắt buộc)"
                                    value={formData.parentId}
                                    onChange={(val) => setFormData({ ...formData, parentId: val })}
                                    options={[
                                        { value: '', label: 'Không có danh mục cha (Root)' },
                                        ...categories
                                            .filter(c => c.id !== editingId)
                                            .map(c => ({ value: c.id, label: c.name }))
                                    ]}
                                />
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
                                    className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 text-sm flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, id: '' })}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message={
                    deleteConfirm.ids && deleteConfirm.ids.length > 0
                        ? `Bạn có chắc muốn xóa ${deleteConfirm.ids.length} thể loại? Hành động này không thể hoàn tác.`
                        : "Bạn có chắc muốn xóa thể loại này? Hành động này không thể hoàn tác."
                }
                confirmText={deleteConfirm.ids ? `Xóa ${deleteConfirm.ids.length} thể loại` : "Xóa thể loại"}
                type="danger"
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-select-arrow {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 1.25rem;
                }
            `}} />
        </div>
    );
};

export default CategoriesManager;
