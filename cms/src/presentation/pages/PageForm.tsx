import { ArrowLeft, Calendar, Edit2, Eye, Globe, Image as ImageIcon, Layout, Save, Settings, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../infrastructure/api.service';
import CustomCheckbox from '../components/atoms/CustomCheckbox';
import CustomSelect from '../components/atoms/CustomSelect';
import MediaPickerModal from '../components/MediaPickerModal';
import PreviewModal from '../components/PreviewModal';
import QuillEditor from '../components/QuillEditor';
import SEOManager from '../components/SEOManager';

const PageForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        isPublished: true,
        status: 'published', // New status field
        showInMenu: false,
        template: 'default',
        metaTitle: '',
        metaDescription: '',
        focusKeyword: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
        publishedAt: new Date().toISOString().slice(0, 16), // datetime-local format
    });

    const statusOptions = [
        { value: 'published', label: 'Công khai' },
        { value: 'draft', label: 'Bản nháp' },
        { value: 'scheduled', label: 'Lên lịch' }
    ];

    const templateOptions = [
        { value: 'default', label: 'Mặc định' },
        { value: 'full-width', label: 'Toàn màn hình' },
        { value: 'landing', label: 'Landing Page' }
    ];

    useEffect(() => {
        if (isEdit) {
            fetchPage();
        }
    }, [id]);

    const fetchPage = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/pages/${id}`);
            setFormData({
                ...data,
                status: data.isPublished ? (new Date(data.publishedAt) > new Date() ? 'scheduled' : 'published') : 'draft',
                publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
            });
        } catch (error) {
            toast.error('Không tải được thông tin trang');
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (title: string) => {
        const slug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');

        setFormData({ ...formData, title, slug, metaTitle: title });
    };

    const handleContentChange = (content: string) => {
        setFormData({ ...formData, content });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                ...formData,
                publishedAt: formData.status === 'scheduled'
                    ? new Date(formData.publishedAt).toISOString()
                    : (formData.status === 'published' && new Date(formData.publishedAt) > new Date()
                        ? new Date().toISOString()
                        : new Date(formData.publishedAt).toISOString())
            };

            if (isEdit) {
                await api.patch(`/pages/${id}`, payload);
                toast.success('Cập nhật trang thành công');
            } else {
                await api.post('/pages', payload);
                toast.success('Tạo trang mới thành công');
                navigate('/pages');
            }
        } catch (error) {
            toast.error('Lưu trang thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500 font-inter">Đang tải...</div>;

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in font-inter pb-20">
                {/* Top Bar */}
                <div className="flex justify-between items-center bg-[#111114] p-4 rounded-2xl border border-white/10 sticky top-0 z-50 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/pages')}
                            className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white font-outfit uppercase">
                                {isEdit ? 'Chỉnh sửa trang' : 'Thêm trang mới'}
                            </h1>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Page Editor Pro</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 rounded-xl text-sm font-bold transition-all active:scale-95"
                        >
                            <Eye size={18} />
                            Xem trước
                        </button>

                        <div className="min-w-[140px] border-l border-white/10 pl-3">
                            <CustomSelect
                                value={formData.status || (formData.isPublished ? 'published' : 'draft')}
                                onChange={(val) => setFormData({ ...formData, status: val, isPublished: val !== 'draft' })}
                                options={statusOptions}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? 'Đang lưu...' : 'Lưu trang'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="col-span-2 space-y-6">
                        <div className="bg-[#111114] border border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Tiêu đề trang</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="Ví dụ: Giới thiệu về chúng tôi..."
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-2xl font-bold text-white focus:border-indigo-500/50 focus:bg-black/60 outline-none transition-all placeholder:text-zinc-800"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <Globe size={12} className="text-zinc-600" />
                                    Đường dẫn tĩnh (Slug)
                                </label>
                                <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-4 py-3 group focus-within:border-indigo-500/50 transition-all">
                                    <span className="text-zinc-600 font-mono text-sm group-focus-within:text-indigo-500/50">/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="flex-1 bg-transparent text-sm text-indigo-400 font-mono outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Layout size={12} className="text-indigo-500" />
                                    Nội dung chính
                                </label>
                                <div className="rounded-2xl overflow-hidden border border-white/5">
                                    <QuillEditor
                                        value={formData.content}
                                        onChange={handleContentChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SEO Section */}
                        <SEOManager
                            data={{
                                metaTitle: formData.metaTitle,
                                metaDescription: formData.metaDescription,
                                focusKeyword: formData.focusKeyword,
                                ogTitle: formData.ogTitle,
                                ogDescription: formData.ogDescription,
                                ogImage: formData.ogImage,
                                twitterTitle: formData.twitterTitle,
                                twitterDescription: formData.twitterDescription,
                                twitterImage: formData.twitterImage,
                            }}
                            defaultTitle={formData.title}
                            defaultDescription={formData.excerpt || formData.content.substring(0, 160).replace(/<[^>]*>/g, '')}
                            slug={formData.slug}
                            onChange={(seoData) => setFormData({ ...formData, ...seoData })}
                        />
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-6">
                        {/* Publish Settings */}
                        <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 space-y-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Settings size={16} className="text-indigo-500" />
                                Cấu hình xuất bản
                            </h2>

                            <div className="space-y-4">
                                {formData.status === 'scheduled' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Thời gian hiển thị</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                            <input
                                                type="datetime-local"
                                                value={formData.publishedAt}
                                                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-zinc-300 outline-none focus:border-indigo-500/50 transition-all font-mono"
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-600 mt-2 ml-1 italic">* Trang sẽ tự động hiển thị sau thời gian này.</p>
                                    </div>
                                )}

                                <CustomSelect
                                    label="Giao diện trang (Template)"
                                    value={formData.template}
                                    onChange={(val) => setFormData({ ...formData, template: val })}
                                    options={templateOptions}
                                />

                                <div className="pt-2">
                                    <CustomCheckbox
                                        checked={formData.showInMenu}
                                        onChange={(val) => setFormData({ ...formData, showInMenu: val })}
                                        label="Hiển thị trong Menu"
                                        description="Tự động thêm trang này vào thanh điều hướng chính của website."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 space-y-4">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={16} className="text-indigo-500" />
                                Ảnh đại diện
                            </h2>
                            {formData.featuredImage ? (
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 group shadow-xl">
                                    <img src={formData.featuredImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                                        <div className="flex gap-2 scale-90 group-hover:scale-100 transition-transform">
                                            <button
                                                type="button"
                                                onClick={() => setShowMediaPicker(true)}
                                                className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, featuredImage: '' })}
                                                className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowMediaPicker(true)}
                                    className="w-full aspect-[4/3] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-all">
                                        <ImageIcon size={24} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Chọn ảnh bìa trang</span>
                                </button>
                            )}
                        </div>

                        {/* Excerpt Section - Moved here */}
                        <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 space-y-4">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Layout size={16} className="text-indigo-500" />
                                Lời trích (Excerpt)
                            </h2>
                            <textarea
                                value={formData.excerpt || ''}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="Viết mô tả ngắn gọn (tối đa 200 ký tự)..."
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-4 text-xs text-zinc-400 min-h-[140px] focus:border-indigo-500/50 outline-none transition-all resize-none leading-relaxed"
                            />
                            <p className="text-[10px] text-zinc-600 text-right">
                                {formData.excerpt?.length || 0}/200
                            </p>
                        </div>
                    </div>
                </div>

                {/* Media Picker Modal */}
                <MediaPickerModal
                    isOpen={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={(url) => {
                        setFormData({ ...formData, featuredImage: url });
                        setShowMediaPicker(false);
                    }}
                    title="Thư viện ảnh đại diện"
                />
            </form>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                data={formData}
            />
        </>
    );
};

export default PageForm;
