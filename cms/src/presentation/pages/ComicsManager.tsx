import { Check, Edit2, ExternalLink, List, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Comic } from '../../core/interfaces';
import { comicService } from '../../infrastructure/api.service';
import Accordion from '../components/atoms/Accordion';
import PageHeader from '../components/atoms/PageHeader';
import SearchInput from '../components/atoms/SearchInput';
import ConfirmModal from '../components/ConfirmModal';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../components/Table';

const ComicsManager = () => {
    const [comics, setComics] = useState<Comic[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Multi-select states
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; title: string; ids?: string[] }>({
        show: false,
        id: '',
        title: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchComics(searchTerm);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const fetchComics = async (search: string) => {
        try {
            setLoading(true);
            const data = await comicService.getComics(search);
            setComics(data);
        } catch (error) {
            toast.error('Không tải được danh sách truyện');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            if (deleteConfirm.ids && deleteConfirm.ids.length > 0) {
                // Bulk delete
                await Promise.all(deleteConfirm.ids.map(id => comicService.deleteComic(id)));
                setComics(comics.filter(c => !deleteConfirm.ids!.includes(c.id)));
                setSelectedIds(new Set());
                toast.success(`Đã xóa ${deleteConfirm.ids.length} truyện`);
            } else {
                // Single delete
                await comicService.deleteComic(deleteConfirm.id);
                setComics(comics.filter(c => c.id !== deleteConfirm.id));
                toast.success('Xóa truyện thành công');
            }
            fetchComics(searchTerm);
        } catch (error) {
            toast.error('Xóa truyện thất bại');
        }
    };

    // Multi-select handlers
    const handleRowClick = (comic: Comic, index: number, e: React.MouseEvent) => {
        if (e.shiftKey && lastSelectedIndex !== null) {
            // Shift + Click: Select range
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const newSelected = new Set(selectedIds);

            for (let i = start; i <= end; i++) {
                newSelected.add(comics[i].id);
            }
            setSelectedIds(newSelected);
        } else if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd + Click: Toggle selection
            const newSelected = new Set(selectedIds);
            if (newSelected.has(comic.id)) {
                newSelected.delete(comic.id);
            } else {
                newSelected.add(comic.id);
            }
            setSelectedIds(newSelected);
            setLastSelectedIndex(index);
        } else {
            // Normal click: Clear selection
            setSelectedIds(new Set());
            setLastSelectedIndex(null);
        }
    };

    const selectAll = () => {
        if (selectedIds.size === comics.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(comics.map(c => c.id)));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setDeleteConfirm({
            show: true,
            id: '',
            title: '',
            ids: Array.from(selectedIds)
        });
    };

    // Group comics by status
    const groupedComics = comics.reduce((acc, comic) => {
        const status = comic.status || 'ONGOING';
        if (!acc[status]) acc[status] = [];
        acc[status].push(comic);
        return acc;
    }, {} as Record<string, Comic[]>);

    const statusLabels: Record<string, string> = {
        'ONGOING': 'Đang tiến hành',
        'COMPLETED': 'Hoàn thành',
        'HIATUS': 'Tạm ngưng',
        'CANCELLED': 'Đã hủy'
    };

    return (
        <div className="space-y-6 animate-fade-in font-inter">
            {/* Header */}
            <PageHeader
                title="Quản lý truyện"
                description={`Tổng cộng ${comics.length} truyện`}
            >
                {selectedIds.size > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-colors"
                    >
                        <Trash2 size={16} />
                        Xóa {selectedIds.size} truyện
                    </button>
                )}

                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Tìm kiếm truyện..."
                    className="w-64"
                />

                <button
                    onClick={() => navigate('/comics/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Plus size={18} />
                    Thêm truyện
                </button>
            </PageHeader>

            {/* Content */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-zinc-500">
                        <List className="animate-pulse mr-2" /> Đang tải...
                    </div>
                ) : comics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
                        <List size={48} className="opacity-20" />
                        <p>Chưa có truyện nào</p>
                    </div>
                ) : (
                    <>
                        {/* Select All */}
                        <div className="flex items-center justify-between px-4">
                            <button
                                onClick={selectAll}
                                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.size === comics.length
                                    ? 'bg-indigo-500 border-indigo-500'
                                    : 'border-white/20'
                                    }`}>
                                    {selectedIds.size === comics.length && <Check size={12} className="text-white" />}
                                </div>
                                {selectedIds.size === comics.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                            <p className="text-xs text-zinc-600">
                                Shift + Click để chọn nhiều • Ctrl/Cmd + Click để chọn từng truyện
                            </p>
                        </div>

                        {/* Grouped by Status */}
                        {Object.entries(groupedComics).map(([status, statusComics]) => (
                            <Accordion
                                key={status}
                                title={statusLabels[status] || status}
                                count={statusComics.length}
                                defaultOpen={true}
                            >
                                <TableContainer className="rounded-none shadow-none border-0">
                                    <TableHeader>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Truyện</TableHead>
                                        <TableHead>Tác giả</TableHead>
                                        <TableHead>Thể loại</TableHead>
                                        <TableHead>Lượt xem</TableHead>
                                        <TableHead align="right">Thao tác</TableHead>
                                    </TableHeader>
                                    <TableBody>
                                        {statusComics.map((comic, index) => {
                                            const globalIndex = comics.findIndex(c => c.id === comic.id);
                                            const isSelected = selectedIds.has(comic.id);

                                            return (
                                                <TableRow
                                                    key={comic.id}
                                                    onClick={(e) => handleRowClick(comic, globalIndex, e)}
                                                    className={isSelected ? 'bg-indigo-500/10 border-indigo-500/30' : ''}
                                                >
                                                    <TableCell>
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                                                            ? 'bg-indigo-500 border-indigo-500'
                                                            : 'border-white/20'
                                                            }`}>
                                                            {isSelected && <Check size={14} className="text-white" />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={comic.thumbnail}
                                                                alt={comic.title}
                                                                className="w-12 h-16 object-cover rounded border border-white/10"
                                                            />
                                                            <div>
                                                                <div className="font-bold text-zinc-200 text-sm">{comic.title}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-zinc-400">{comic.author}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {comic.categories?.slice(0, 2).map((cat: any) => (
                                                                <span key={cat.id} className="px-2 py-0.5 bg-white/5 rounded text-xs text-zinc-400">
                                                                    {cat.name}
                                                                </span>
                                                            ))}
                                                            {(comic.categories?.length || 0) > 2 && (
                                                                <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-zinc-500">
                                                                    +{(comic.categories?.length || 0) - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-zinc-400">{comic.views?.toLocaleString() || 0}</TableCell>
                                                    <TableCell align="right">
                                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => navigate(`/comics/${comic.id}/chapters`)}
                                                                className="p-2.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all bg-transparent border-none active:scale-90"
                                                                title="Quản lý chương"
                                                            >
                                                                <List size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/comics/edit/${comic.id}`)}
                                                                className="p-2.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all bg-transparent border-none active:scale-90"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm({ show: true, id: comic.id, title: comic.title })}
                                                                className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all bg-transparent border-none active:scale-90"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                            <a
                                                                href={`http://localhost:3000/comic/${comic.slug}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-90 flex"
                                                            >
                                                                <ExternalLink size={18} />
                                                            </a>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </TableContainer>
                            </Accordion>
                        ))}
                    </>
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, id: '', title: '' })}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message={
                    deleteConfirm.ids && deleteConfirm.ids.length > 0
                        ? `Bạn có chắc muốn xóa ${deleteConfirm.ids.length} truyện? Hành động này không thể hoàn tác.`
                        : `Bạn có chắc muốn xóa truyện "${deleteConfirm.title}"? Hành động này không thể hoàn tác.`
                }
                confirmText={deleteConfirm.ids ? `Xóa ${deleteConfirm.ids.length} truyện` : "Xóa truyện"}
                type="danger"
            />
        </div>
    );
};

export default ComicsManager;
