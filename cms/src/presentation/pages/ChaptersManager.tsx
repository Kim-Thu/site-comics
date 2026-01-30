import { ArrowLeft, Edit2, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { chapterService, comicService } from '../../infrastructure/api.service';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../components/Table';

const ChaptersManager = () => {
    const { id } = useParams(); // Comic ID
    const navigate = useNavigate();
    const [comic, setComic] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string }>({ show: false, id: '' });
    const [selectedChapter, setSelectedChapter] = useState<any>(null);

    const [formData, setFormData] = useState({
        number: 1,
        title: '',
        slug: '',
        images: [] as string[]
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const comicData = await comicService.getComicById(id!);
            setComic(comicData);

            const chaptersData = await chapterService.getChapters(id!);
            setChapters(chaptersData);
        } catch (error) {
            console.error('Failed to fetch data');
            toast.error('Không thể tải danh sách chương');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (chapter: any) => {
        setSelectedChapter(chapter);
        setFormData({
            number: chapter.number,
            title: chapter.title || '',
            slug: chapter.slug || '',
            images: chapter.images || []
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedChapter(null);
        setFormData({
            number: chapters.length > 0 ? Math.max(...chapters.map(c => c.number)) + 1 : 1,
            title: '',
            slug: '',
            images: []
        });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            await chapterService.deleteChapter(deleteConfirm.id);
            toast.success('Xóa chương thành công');
            fetchData();
        } catch (error) {
            toast.error('Xóa chương thất bại');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedChapter) {
                await chapterService.updateChapter(selectedChapter.id, formData);
                toast.success('Cập nhật chương thành công');
            } else {
                await chapterService.createChapter({ ...formData, comicId: id });
                toast.success('Thêm chương mới thành công');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in font-inter">
            <PageHeader
                title={
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/comics')}
                            className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all bg-transparent border-none"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex flex-col">
                            <div className="text-2xl font-bold text-white font-outfit truncate max-w-[400px]">
                                CHƯƠNG: <span className="text-indigo-400 uppercase">{comic?.title}</span>
                            </div>
                            <p className="text-zinc-500 text-sm font-medium mt-1">Quản lý danh sách các chương truyện</p>
                        </div>
                    </div>
                }
            >
                <button
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95 gap-2 text-sm"
                >
                    <Plus size={18} />
                    Thêm chương mới
                </button>
            </PageHeader>

            <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-0 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
                <TableContainer>
                    <TableHeader>
                        <TableHead>STT</TableHead>
                        <TableHead>Tên chương</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Ngày cập nhật</TableHead>
                        <TableHead align="right">Thao tác</TableHead>
                    </TableHeader>
                    <TableBody isEmpty={chapters.length === 0} emptyMessage="Chưa có chương nào được cập nhật." colSpan={5}>
                        {chapters.sort((a, b) => b.number - a.number).map((ch) => (
                            <TableRow key={ch.id} className="group">
                                <TableCell>
                                    <div className="font-mono text-indigo-400 font-bold">{ch.number}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{ch.title || `Chương ${ch.number}`}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs text-zinc-500 font-mono italic">{ch.slug}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs text-zinc-600">{new Date(ch.updatedAt).toLocaleDateString()}</div>
                                </TableCell>
                                <TableCell align="right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(ch)}
                                            className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-all bg-transparent border-none"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm({ show: true, id: ch.id })}
                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all bg-transparent border-none"
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

            {/* Chapter Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-inter">
                    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-xl shadow-2xl animate-zoom-in">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold font-outfit text-white">
                                {selectedChapter ? `Sửa chương ${selectedChapter.number}` : 'Thêm chương mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 bg-transparent border-none">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">STT chương</label>
                                    <input type="number" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500" value={formData.number} onChange={e => setFormData({ ...formData, number: Number(e.target.value) })} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Tên chương (Tùy chọn)</label>
                                    <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500" placeholder="VD: Khởi đầu mới" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Slug (Đường dẫn)</label>
                                <input type="text" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-zinc-100 text-sm font-mono focus:outline-none focus:border-indigo-500" placeholder="chuong-1" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-white/5 text-zinc-400 hover:bg-white/10 transition-colors text-sm">Hủy</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 text-sm">Lưu chương</button>
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
                message="Bạn có chắc muốn xóa chương này? Hành động này không thể hoàn tác."
                confirmText="Xóa chương"
                type="danger"
            />
        </div>
    );
};

export default ChaptersManager;
