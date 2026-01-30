import axios from 'axios';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Comic } from '../../core/interfaces';
import { comicService } from '../../infrastructure/api.service';
import { AuthState, useAuthStore } from '../../store/auth.store';
import CustomSelect from './CustomSelect';

interface ComicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    comic?: Comic | null;
}

const ComicModal = ({ isOpen, onClose, onSuccess, comic }: ComicModalProps) => {
    const token = useAuthStore((state: AuthState) => state.token);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        author: '',
        description: '',
        status: 'ongoing',
        thumbnail: '',
        categoryIds: [] as string[]
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (comic) {
            setFormData({
                title: comic.title || '',
                slug: comic.slug || '',
                author: comic.author || '',
                description: comic.description || '',
                status: comic.status || 'ongoing',
                thumbnail: comic.thumbnail || '',
                categoryIds: comic.categories?.map((c: any) => c.id) || []
            });
        } else {
            setFormData({
                title: '',
                slug: '',
                author: '',
                description: '',
                status: 'ongoing',
                thumbnail: '',
                categoryIds: []
            });
        }
    }, [comic, isOpen]);

    const fetchCategories = async () => {
        try {
            const data = await comicService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await axios.post('http://localhost:3001/upload/image', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData(prev => ({ ...prev, thumbnail: res.data.url }));
            toast.success('Tải ảnh lên thành công');
        } catch (error) {
            toast.error('Tải ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (comic) {
                await comicService.updateComic(comic.id, formData);
                toast.success('Cập nhật truyện thành công');
            } else {
                await comicService.createComic(formData);
                toast.success('Thêm truyện mới thành công');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-inter">
            <div className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-zoom-in">
                <div className="sticky top-0 bg-[#111114]/80 backdrop-blur-md px-6 py-4 border-b border-white/5 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold font-outfit text-white">
                        {comic ? 'Chỉnh sửa truyện' : 'Thêm truyện mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors bg-transparent border-none">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Tên truyện</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Slug (Đường dẫn)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Tác giả</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                    value={formData.author}
                                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <CustomSelect
                                    label="Trạng thái"
                                    value={formData.status}
                                    onChange={val => setFormData({ ...formData, status: val })}
                                    options={[
                                        { value: 'ongoing', label: 'Đang ra' },
                                        { value: 'completed', label: 'Hoàn thành' },
                                        { value: 'hiatus', label: 'Tạm ngưng' }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 text-center">
                            <label className="text-xs font-bold text-zinc-500 uppercase block text-left">Ảnh bìa (Thumbnail)</label>
                            <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto bg-white/[0.02] border border-dashed border-white/10 rounded-2xl overflow-hidden group">
                                {formData.thumbnail ? (
                                    <img src={formData.thumbnail} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                                        <ImageIcon size={40} className="mb-2" />
                                        <span className="text-[10px] uppercase font-bold">Chưa có ảnh</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <span className="text-white text-xs font-bold">Thay đổi ảnh</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-indigo-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Mô tả ngắn</label>
                        <textarea
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm min-h-[100px] resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Thể loại</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {categories.map(cat => (
                                <label key={cat.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-indigo-500 transition-colors"
                                        checked={formData.categoryIds.includes(cat.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({ ...formData, categoryIds: [...formData.categoryIds, cat.id] });
                                            } else {
                                                setFormData({ ...formData, categoryIds: formData.categoryIds.filter(id => id !== cat.id) });
                                            }
                                        }}
                                    />
                                    <span className="text-xs text-zinc-300">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl font-bold bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors text-sm"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {comic ? 'Lưu thay đổi' : 'Thêm truyện'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComicModal;
