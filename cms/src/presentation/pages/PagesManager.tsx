import { Check, Edit2, ExternalLink, FileText, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '../../infrastructure/api.service';
import Accordion from '../components/atoms/Accordion';
import PageHeader from '../components/atoms/PageHeader';
import SearchInput from '../components/atoms/SearchInput';
import ConfirmModal from '../components/ConfirmModal';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../components/Table';

interface Page {
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    views: number;
    createdAt: string;
}

const PagesManager = () => {
    const [pages, setPages] = useState<Page[]>([]);
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
        fetchPages();
    }, [searchTerm]);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/pages', { params: { search: searchTerm } });
            setPages(data);
        } catch (error) {
            toast.error('Không tải được danh sách trang');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            if (deleteConfirm.ids && deleteConfirm.ids.length > 0) {
                await Promise.all(deleteConfirm.ids.map(id => api.delete(`/pages/${id}`)));
                setPages(pages.filter(p => !deleteConfirm.ids!.includes(p.id)));
                setSelectedIds(new Set());
                toast.success(`Đã xóa ${deleteConfirm.ids.length} trang`);
            } else {
                await api.delete(`/pages/${deleteConfirm.id}`);
                setPages(pages.filter(p => p.id !== deleteConfirm.id));
                toast.success('Xóa trang thành công');
            }
        } catch (error) {
            toast.error('Xóa trang thất bại');
        } finally {
            setDeleteConfirm({ show: false, id: '', title: '' });
        }
    };

    // Multi-select handlers
    const handleRowClick = (page: Page, index: number, e: React.MouseEvent) => {
        if (e.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const newSelected = new Set(selectedIds);
            for (let i = start; i <= end; i++) {
                newSelected.add(pages[i].id);
            }
            setSelectedIds(newSelected);
        } else if (e.ctrlKey || e.metaKey) {
            const newSelected = new Set(selectedIds);
            if (newSelected.has(page.id)) {
                newSelected.delete(page.id);
            } else {
                newSelected.add(page.id);
            }
            setSelectedIds(newSelected);
            setLastSelectedIndex(index);
        } else {
            setSelectedIds(new Set());
            setLastSelectedIndex(null);
        }
    };

    const selectAll = () => {
        if (selectedIds.size === pages.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pages.map(p => p.id)));
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

    const groupedPages = pages.reduce((acc, page) => {
        const group = page.isPublished ? 'Đã xuất bản' : 'Bản nháp';
        if (!acc[group]) acc[group] = [];
        acc[group].push(page);
        return acc;
    }, {} as Record<string, Page[]>);

    return (
        <div className="space-y-6 animate-fade-in font-inter">
            <PageHeader
                title="Quản lý Trang"
                description={`Tạo và quản lý các trang tĩnh trên website (Giới thiệu, Liên hệ, Chính sách...)${selectedIds.size > 0 ? ` • ${selectedIds.size} đã chọn` : ''}`}
            >
                {selectedIds.size > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-colors"
                    >
                        <Trash2 size={16} />
                        Xóa {selectedIds.size} trang
                    </button>
                )}

                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Tìm kiếm trang..."
                    className="w-64"
                />

                <button
                    onClick={() => navigate('/pages/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Plus size={18} />
                    Thêm trang mới
                </button>
            </PageHeader>

            {/* Content */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-zinc-500">Đang tải...</div>
                ) : pages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
                        <FileText size={48} className="opacity-20" />
                        <p>Chưa có trang nào</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between px-4">
                            <button
                                onClick={selectAll}
                                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.size === pages.length
                                    ? 'bg-indigo-500 border-indigo-500'
                                    : 'border-white/20'
                                    }`}>
                                    {selectedIds.size === pages.length && <Check size={12} className="text-white" />}
                                </div>
                                {selectedIds.size === pages.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                        </div>

                        {Object.entries(groupedPages).map(([group, groupPages]) => (
                            <Accordion
                                key={group}
                                title={group}
                                count={groupPages.length}
                                defaultOpen={true}
                            >
                                <TableContainer className="rounded-none shadow-none border-0">
                                    <TableHeader>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Tiêu đề</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Lượt xem</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead align="right">Thao tác</TableHead>
                                    </TableHeader>
                                    <TableBody>
                                        {groupPages.map((page, index) => {
                                            const isSelected = selectedIds.has(page.id);
                                            return (
                                                <TableRow
                                                    key={page.id}
                                                    onClick={(e) => handleRowClick(page, index, e)}
                                                    className={`cursor-pointer ${isSelected
                                                        ? 'bg-indigo-500/10 border-indigo-500/30'
                                                        : ''
                                                        }`}
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
                                                        <span className="font-bold text-zinc-200 text-sm">{page.title}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="text-sm text-zinc-400">/{page.slug}</code>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-zinc-400">{page.views || 0}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-zinc-400">
                                                            {new Date(page.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => navigate(`/pages/edit/${page.id}`)}
                                                                className="p-2.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm({ show: true, id: page.id, title: page.title })}
                                                                className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                            <a
                                                                href={`http://localhost:3000/page/${page.slug}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
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

            <ConfirmModal
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, id: '', title: '' })}
                onConfirm={handleDelete}
                title="Xác nhận xóa trang"
                message={
                    deleteConfirm.ids && deleteConfirm.ids.length > 0
                        ? `Bạn có chắc muốn xóa ${deleteConfirm.ids.length} trang?`
                        : `Bạn có chắc muốn xóa trang "${deleteConfirm.title}"?`
                }
                confirmText="Xóa trang"
                type="danger"
            />
        </div>
    );
};

export default PagesManager;
