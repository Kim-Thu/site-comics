import { Check, Copy, Image as ImageIcon, Trash2, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { mediaService } from '../../infrastructure/api.service';
import Accordion from '../components/atoms/Accordion';
import PageHeader from '../components/atoms/PageHeader';
import SearchInput from '../components/atoms/SearchInput';
import ConfirmModal from '../components/ConfirmModal';

interface Media {
    id: string;
    url: string;
    filename: string;
    caption?: string;
    alt?: string;
    size: number;
    mimeType: string;
    user?: { name: string; email: string };
    createdAt: string;
}

const MediaManager = () => {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Multi-select states
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; ids?: string[] }>({
        show: false,
        id: ''
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchMedia();
        }, 300);
        return () => clearTimeout(timeout);
    }, [page, search]);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const { data, meta } = await mediaService.getMedia({
                page, limit: 24, search
            });
            setMedia(data);
            setTotalPages(meta.last_page);
        } catch (error) {
            console.error(error);
            toast.error('Không tải được thư viện ảnh');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        try {
            setUploading(true);
            await mediaService.uploadImage(file);
            toast.success('Upload thành công');
            fetchMedia();
        } catch (error) {
            console.error(error);
            toast.error('Upload thất bại');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async () => {
        try {
            if (deleteConfirm.ids && deleteConfirm.ids.length > 0) {
                // Bulk delete
                await Promise.all(deleteConfirm.ids.map(id => mediaService.deleteMedia(id)));
                setMedia(media.filter(m => !deleteConfirm.ids!.includes(m.id)));
                setSelectedIds(new Set());
                toast.success(`Đã xóa ${deleteConfirm.ids.length} ảnh`);
            } else {
                // Single delete
                await mediaService.deleteMedia(deleteConfirm.id);
                setMedia(media.filter(m => m.id !== deleteConfirm.id));
                if (selectedMedia?.id === deleteConfirm.id) setSelectedMedia(null);
                toast.success('Đã xóa');
            }
        } catch (error) {
            toast.error('Xóa thất bại');
        }
    };

    const handleUpdate = async (id: string, data: Partial<Media>) => {
        try {
            await mediaService.updateMedia(id, data);
            setMedia(media.map(m => m.id === id ? { ...m, ...data } : m));
            if (selectedMedia?.id === id) setSelectedMedia({ ...selectedMedia, ...data });
            toast.success('Đã cập nhật');
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Đã sao chép URL');
    };

    // Multi-select handlers
    const handleMediaClick = (item: Media, index: number, e: React.MouseEvent) => {
        if (e.shiftKey && lastSelectedIndex !== null) {
            // Shift + Click: Select range
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const newSelected = new Set(selectedIds);

            for (let i = start; i <= end; i++) {
                newSelected.add(media[i].id);
            }
            setSelectedIds(newSelected);
        } else if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd + Click: Toggle selection
            const newSelected = new Set(selectedIds);
            if (newSelected.has(item.id)) {
                newSelected.delete(item.id);
            } else {
                newSelected.add(item.id);
            }
            setSelectedIds(newSelected);
            setLastSelectedIndex(index);
        } else {
            // Normal click: Open detail
            setSelectedMedia(item);
            setSelectedIds(new Set());
            setLastSelectedIndex(null);
        }
    };

    const selectAll = () => {
        if (selectedIds.size === media.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(media.map(m => m.id)));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setDeleteConfirm({ show: true, id: '', ids: Array.from(selectedIds) });
    };

    // Group media by date
    const groupedMedia = media.reduce((acc, item) => {
        const date = new Date(item.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {} as Record<string, Media[]>);

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 font-inter">
            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-6">
                <PageHeader
                    title="Thư viện ảnh"
                    description={`Quản lý toàn bộ hình ảnh trên hệ thống${selectedIds.size > 0 ? ` • ${selectedIds.size} đã chọn` : ''}`}
                >
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-colors"
                        >
                            <Trash2 size={16} />
                            Xóa {selectedIds.size} ảnh
                        </button>
                    )}

                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Tìm kiếm ảnh..."
                        className="w-64"
                    />

                    <label className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all
                        ${uploading ? 'bg-indigo-500/50 cursor-wait' : 'bg-indigo-500 hover:bg-indigo-600 active:scale-95'}
                        text-white shadow-lg shadow-indigo-500/20
                    `}>
                        <Upload size={18} />
                        {uploading ? 'Đang tải...' : 'Tải lên'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                    </label>
                </PageHeader>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-zinc-500">Đang tải...</div>
                    ) : media.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
                            <ImageIcon size={48} className="opacity-20" />
                            <p>Chưa có hình ảnh nào</p>
                        </div>
                    ) : (
                        <>
                            {/* Select All Button */}
                            <div className="flex items-center justify-between px-4">
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.size === media.length
                                        ? 'bg-indigo-500 border-indigo-500'
                                        : 'border-white/20'
                                        }`}>
                                        {selectedIds.size === media.length && <Check size={12} className="text-white" />}
                                    </div>
                                    {selectedIds.size === media.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                </button>
                                <p className="text-xs text-zinc-600">
                                    Shift + Click để chọn nhiều • Ctrl/Cmd + Click để chọn từng ảnh
                                </p>
                            </div>

                            {/* Grouped by Date */}
                            {Object.entries(groupedMedia).map(([date, items]) => (
                                <Accordion
                                    key={date}
                                    title={date}
                                    count={items.length}
                                    defaultOpen={true}
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {items.map((item, index) => {
                                            const globalIndex = media.findIndex(m => m.id === item.id);
                                            const isSelected = selectedIds.has(item.id);

                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={(e) => handleMediaClick(item, globalIndex, e)}
                                                    className={`
                                                        group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                                                        ${isSelected
                                                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-95'
                                                            : selectedMedia?.id === item.id
                                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                                                : 'border-white/5 hover:border-white/20'
                                                        }
                                                    `}
                                                >
                                                    <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />

                                                    {/* Selection Checkbox */}
                                                    <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                                                        ? 'bg-indigo-500 border-indigo-500'
                                                        : 'bg-black/50 border-white/30 opacity-0 group-hover:opacity-100'
                                                        }`}>
                                                        {isSelected && <Check size={14} className="text-white" />}
                                                    </div>

                                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <p className="text-[10px] text-white truncate">{item.filename}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Accordion>
                            ))}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded-lg border border-white/10 text-zinc-400 hover:text-white disabled:opacity-50 text-sm"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1 text-zinc-500 text-sm">Trang {page} / {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded-lg border border-white/10 text-zinc-400 hover:text-white disabled:opacity-50 text-sm"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar Details */}
            {selectedMedia && (
                <div className="w-80 bg-[#111114] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 h-full overflow-y-auto animate-slide-in-right">
                    <div className="flex justify-between items-start">
                        <h2 className="text-lg font-bold text-white">Chi tiết</h2>
                        <button onClick={() => setSelectedMedia(null)} className="text-zinc-500 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center">
                        <img src={selectedMedia.url} className="max-w-full max-h-full object-contain" alt="" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Tên file</label>
                            <p className="text-sm text-zinc-300 break-all">{selectedMedia.filename}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Kích thước</label>
                            <p className="text-sm text-zinc-300">{(selectedMedia.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Loại</label>
                            <p className="text-sm text-zinc-300">{selectedMedia.mimeType}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Người tải</label>
                            <p className="text-sm text-zinc-300">{selectedMedia.user?.name || 'Unknown'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Ngày tải</label>
                            <p className="text-sm text-zinc-300">{new Date(selectedMedia.createdAt).toLocaleString('vi-VN')}</p>
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Tiêu đề (Caption)</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500 outline-none"
                                    value={selectedMedia.caption || ''}
                                    onChange={(e) => setSelectedMedia({ ...selectedMedia, caption: e.target.value })}
                                    onBlur={(e) => handleUpdate(selectedMedia.id, { caption: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Văn bản thay thế (Alt)</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500 outline-none"
                                    value={selectedMedia.alt || ''}
                                    onChange={(e) => setSelectedMedia({ ...selectedMedia, alt: e.target.value })}
                                    onBlur={(e) => handleUpdate(selectedMedia.id, { alt: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                            <button
                                onClick={() => copyToClipboard(selectedMedia.url)}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-zinc-300 transition-colors"
                            >
                                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                {copied ? 'Đã sao chép' : 'Sao chép URL'}
                            </button>
                            <button
                                onClick={() => setDeleteConfirm({ show: true, id: selectedMedia.id })}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Trash2 size={16} />
                                Xóa vĩnh viễn
                            </button>
                        </div>
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
                        ? `Bạn có chắc muốn xóa ${deleteConfirm.ids.length} ảnh? Hành động này không thể hoàn tác.`
                        : "Bạn có chắc muốn xóa ảnh này? Hành động này không thể hoàn tác."
                }
                confirmText={deleteConfirm.ids ? `Xóa ${deleteConfirm.ids.length} ảnh` : "Xóa ảnh"}
                type="danger"
            />
        </div>
    );
};

export default MediaManager;
