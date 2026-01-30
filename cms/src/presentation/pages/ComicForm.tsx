import { ArrowLeft, Image as ImageIcon, Loader2, Plus, Save, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { comicService } from '../../infrastructure/api.service';
import { AuthState, useAuthStore } from '../../store/auth.store';
import CustomSelect from '../components/CustomSelect';
import QuillEditor from '../components/QuillEditor';

// Utility to remove accents for better searching
const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

const ComicForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useAuthStore((state: AuthState) => state.token);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    // Search states
    const [categorySearch, setCategorySearch] = useState('');
    const [tagSearch, setTagSearch] = useState('');

    // Modals for creating new items
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [creatingItem, setCreatingItem] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        author: '',
        description: '',
        status: 'ongoing',
        thumbnail: '',
        categoryIds: [] as string[],
        tagIds: [] as string[]
    });

    useEffect(() => {
        fetchInitialData();
        if (id) {
            fetchComic();
        }
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const [cats, tgs] = await Promise.all([
                comicService.getCategories(),
                comicService.getTags()
            ]);
            setCategories(cats);
            setTags(tgs);
        } catch (error) {
            console.error('Failed to fetch initial data');
        }
    };

    const fetchComic = async () => {
        try {
            setFetching(true);
            const comic = await comicService.getComicById(id!);

            if (comic) {
                setFormData({
                    title: comic.title || '',
                    slug: comic.slug || '',
                    author: comic.author || '',
                    description: comic.description || '',
                    status: comic.status || 'ongoing',
                    thumbnail: comic.thumbnail || '',
                    categoryIds: comic.categories?.map((c: any) => c.id) || [],
                    tagIds: comic.tagIds || []
                });
            }
        } catch (error) {
            toast.error('Không thể tải thông tin truyện');
        } finally {
            setFetching(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await comicService.uploadImage(file);
            setFormData(prev => ({ ...prev, thumbnail: res.url }));
            toast.success('Tải ảnh lên thành công');
        } catch (error) {
            toast.error('Tải ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        setCreatingItem(true);
        try {
            const slug = newItemName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const res = await comicService.createCategory({ name: newItemName, slug });
            setCategories([...categories, res]);
            setFormData(prev => ({ ...prev, categoryIds: [...prev.categoryIds, res.id] }));
            toast.success('Đã thêm thể loại mới');
            setShowCategoryModal(false);
            setNewItemName('');
        } catch (error) {
            toast.error('Không thể tạo thể loại');
        } finally {
            setCreatingItem(false);
        }
    };

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        setCreatingItem(true);
        try {
            const slug = newItemName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const res = await comicService.createTag({ name: newItemName, slug });
            setTags([...tags, res]);
            setFormData(prev => ({ ...prev, tagIds: [...prev.tagIds, res.id] }));
            toast.success('Đã thêm tag mới');
            setShowTagModal(false);
            setNewItemName('');
        } catch (error) {
            toast.error('Không thể tạo tag');
        } finally {
            setCreatingItem(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await comicService.updateComic(id, formData);
                toast.success('Cập nhật truyện thành công');
            } else {
                await comicService.createComic(formData);
                toast.success('Thêm truyện mới thành công');
            }
            navigate('/comics');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Filtered lists
    const filteredCategories = categories.filter(cat =>
        removeAccents(cat.name).includes(removeAccents(categorySearch))
    );

    const filteredTags = tags.filter(tag =>
        removeAccents(tag.name).includes(removeAccents(tagSearch))
    );

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in font-inter">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-40 bg-[#070708]/80 backdrop-blur-md py-4 border-b border-white/5 -mx-4 px-4 sm:-mx-8 sm:px-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/comics')}
                        className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all bg-transparent border-none"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">
                            {id ? 'Chỉnh sửa truyện' : 'Thêm truyện mới'}
                        </h1>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest hidden sm:block">
                            {id ? 'Cập nhật nội dung & SEO' : 'Thiết lập truyện mới'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/comics')}
                        className="px-6 py-2.5 rounded-xl font-bold bg-white/5 text-zinc-400 hover:bg-white/10 transition-all text-sm"
                    >
                        Hủy
                    </button>
                    <button
                        form="comic-form"
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center px-8 py-2.5 rounded-xl font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95 gap-2 text-sm disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {id ? 'Lưu thay đổi' : 'Đăng truyện'}
                    </button>
                </div>
            </div>

            <form id="comic-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-20">
                {/* Main Content Area (3/4) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl shadow-2xl space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tiêu đề truyện</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-lg font-bold text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                placeholder="Nhập tên bộ truyện..."
                                value={formData.title}
                                onChange={e => {
                                    const title = e.target.value;
                                    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                    setFormData({ ...formData, title, slug });
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Slug (Đường dẫn)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-400 focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono"
                                    placeholder="ten-truyen-slug"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tác giả</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                                    placeholder="Tên tác giả..."
                                    value={formData.author}
                                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pb-10">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1 block mb-4">Mô tả nội dung</label>
                            <QuillEditor
                                value={formData.description}
                                onChange={(val) => setFormData({ ...formData, description: val })}
                                placeholder="Nhập tóm tắt nội dung truyện..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar area (1/4) */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Thumbnail */}
                    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02] backdrop-blur-xl shadow-2xl space-y-4">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block pl-1">Ảnh bìa</label>
                        <div className="relative aspect-[3/4] w-full bg-white/[0.02] border-2 border-dashed border-white/10 rounded-2xl overflow-hidden group transition-all hover:border-indigo-500/40">
                            {formData.thumbnail ? (
                                <img src={formData.thumbnail} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
                                    <ImageIcon size={40} className="mb-2 opacity-20" />
                                    <span className="text-[10px] uppercase font-black tracking-tighter opacity-30">Chưa có ảnh</span>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-indigo-500/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                                <ImageIcon size={24} className="mb-2 text-white" />
                                <span className="text-white text-[10px] font-black uppercase">Tải ảnh lên</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 bg-[#070708]/90 flex flex-col items-center justify-center">
                                    <Loader2 className="animate-spin text-indigo-500 mb-2" />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Đang xử lý...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02] backdrop-blur-xl shadow-2xl space-y-4">
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

                    {/* Categories Checkbox List */}
                    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02] backdrop-blur-xl shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Thể loại</label>
                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(true)}
                                className="p-1.5 hover:bg-indigo-500/10 rounded-lg text-indigo-500 transition-all bg-transparent border-none"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Category Search */}
                        <div className="relative group">
                            <input
                                type="text"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                placeholder="Tìm kiếm thể loại..."
                                value={categorySearch}
                                onChange={e => setCategorySearch(e.target.value)}
                            />
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                        </div>

                        <div className="space-y-1 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredCategories.length > 0 ? filteredCategories.map(cat => (
                                <label key={cat.id} className="flex items-center gap-3 p-2 rounded-lg group cursor-pointer hover:bg-white/[0.02] transition-colors">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="peer absolute opacity-0 w-full h-full cursor-pointer z-10"
                                            checked={formData.categoryIds.includes(cat.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, categoryIds: [...formData.categoryIds, cat.id] });
                                                } else {
                                                    setFormData({ ...formData, categoryIds: formData.categoryIds.filter(id => id !== cat.id) });
                                                }
                                            }}
                                        />
                                        <div className="h-5 w-5 rounded-md border-2 border-white/10 bg-white/5 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 peer-checked:[&>svg]:opacity-100 transition-all flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-white opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${formData.categoryIds.includes(cat.id) ? 'text-indigo-400 font-bold' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                        {cat.name}
                                    </span>
                                </label>
                            )) : (
                                <p className="text-[10px] text-zinc-600 italic py-2 text-center">Không tìm thấy thể loại nào</p>
                            )}
                        </div>
                    </div>

                    {/* Tags Checkbox List */}
                    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02] backdrop-blur-xl shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tags (Nhãn)</label>
                            <button
                                type="button"
                                onClick={() => setShowTagModal(true)}
                                className="p-1.5 hover:bg-purple-500/10 rounded-lg text-purple-500 transition-all bg-transparent border-none"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Tag Search */}
                        <div className="relative group">
                            <input
                                type="text"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all"
                                placeholder="Tìm kiếm tag..."
                                value={tagSearch}
                                onChange={e => setTagSearch(e.target.value)}
                            />
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                        </div>

                        <div className="space-y-1 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredTags.length > 0 ? filteredTags.map(tag => (
                                <label key={tag.id} className="flex items-center gap-3 p-2 rounded-lg group cursor-pointer hover:bg-white/[0.02] transition-colors">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="peer absolute opacity-0 w-full h-full cursor-pointer z-10"
                                            checked={formData.tagIds.includes(tag.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, tagIds: [...formData.tagIds, tag.id] });
                                                } else {
                                                    setFormData({ ...formData, tagIds: formData.tagIds.filter(id => id !== tag.id) });
                                                }
                                            }}
                                        />
                                        <div className="h-5 w-5 rounded-md border-2 border-white/10 bg-white/5 peer-checked:bg-purple-500 peer-checked:border-purple-500 peer-checked:[&>svg]:opacity-100 transition-all flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-white opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${formData.tagIds.includes(tag.id) ? 'text-purple-400 font-bold' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                        #{tag.name}
                                    </span>
                                </label>
                            )) : (
                                <p className="text-[10px] text-zinc-600 italic py-2 text-center">Không tìm thấy tag nào</p>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* Modals */}
            {(showCategoryModal || showTagModal) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#111114] border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl animate-zoom-in">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold font-outfit text-white">
                                {showCategoryModal ? 'Thêm thể loại mới' : 'Thêm Tag mới'}
                            </h2>
                            <button onClick={() => { setShowCategoryModal(false); setShowTagModal(false); setNewItemName(''); }} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 bg-transparent border-none transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={showCategoryModal ? handleCreateCategory : handleCreateTag} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tên {showCategoryModal ? 'thể loại' : 'tag'}</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                    placeholder="Ví dụ: Hành động, #Adventure..."
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowCategoryModal(false); setShowTagModal(false); setNewItemName(''); }}
                                    className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-white/5 text-zinc-400 hover:bg-white/10 transition-all text-sm"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingItem}
                                    className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 text-sm flex items-center justify-center gap-2"
                                >
                                    {creatingItem ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    Xác nhận thêm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
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

export default ComicForm;
