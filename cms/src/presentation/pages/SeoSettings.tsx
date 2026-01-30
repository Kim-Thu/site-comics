import {
    AlertCircle,
    BookOpen,
    FileText,
    Globe,
    Hash,
    Image as ImageIcon,
    Layout,
    Save,
    Share2,
    Twitter
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { settingService } from '../../infrastructure/api.service';

const SeoSettings = () => {
    const [seo, setSeo] = useState<any>({
        homeTitle: '',
        homeDescription: '',
        comicTitleTemplate: '',
        comicDescTemplate: '',
        genreTitleTemplate: '',
        genreDescTemplate: '',
        chapterTitleTemplate: '',
        globalKeywords: [],
        ogImage: '',
        twitterHandle: '',
        googleVerifyCode: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        fetchSeo();
    }, []);

    const fetchSeo = async () => {
        try {
            setLoading(true);
            const data = await settingService.getSeo();
            setSeo(data);
        } catch (error) {
            toast.error('Không thể lấy cấu hình SEO');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await settingService.updateSeo(seo);
            toast.success('Đã cập nhật cấu hình SEO thành công');
        } catch (error) {
            toast.error('Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    );

    const tabs = [
        { id: 'home', label: 'Trang chủ', icon: <Layout size={18} /> },
        { id: 'comics', label: 'Trang truyện', icon: <BookOpen size={18} /> },
        { id: 'genres', label: 'Thể loại', icon: <Hash size={18} /> },
        { id: 'global', label: 'MXH & Chung', icon: <Globe size={18} /> },
    ];

    return (
        <div className="max-w-6xl space-y-8 pb-20 font-inter">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-outfit">Cấu hình SEO</h1>
                    <p className="text-zinc-500 text-sm">Quản lý các cấu trúc Title, Description cho toàn bộ website.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-4 py-2 rounded-lg">
                    <AlertCircle size={14} />
                    <span>Placeholder: %%title%%, %%author%%, %%genre%%</span>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all
              ${activeTab === tab.id
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
            `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSave} className="space-y-10">
                <div className="min-h-[400px]">
                    {/* Home Tab */}
                    {activeTab === 'home' && (
                        <div className="space-y-6 animate-fade-in animate-slide-up">
                            <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2 font-outfit">
                                <Layout size={20} className="text-indigo-500" /> Cấu hình Trang Chủ
                            </h2>
                            <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl shadow-indigo-500/5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500">Tiêu đề Trang Chủ</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                                        value={seo.homeTitle}
                                        onChange={(e) => setSeo({ ...seo, homeTitle: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500">Google Verify Code</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                                        value={seo.googleVerifyCode || ''}
                                        onChange={(e) => setSeo({ ...seo, googleVerifyCode: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-zinc-500">Mô tả Trang Chủ</label>
                                    <textarea
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm min-h-[100px] resize-none"
                                        value={seo.homeDescription}
                                        onChange={(e) => setSeo({ ...seo, homeDescription: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comics Tab */}
                    {activeTab === 'comics' && (
                        <div className="space-y-8 animate-fade-in animate-slide-up">
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2 font-outfit">
                                    <BookOpen size={20} className="text-purple-500" /> Trang Chi Tiết Truyện
                                </h2>
                                <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl space-y-6 shadow-2xl shadow-indigo-500/5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                                            <span>Tiêu đề Template</span>
                                            <span className="text-[10px] text-zinc-600 font-mono">%%title%%, %%author%%</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                            value={seo.comicTitleTemplate}
                                            onChange={(e) => setSeo({ ...seo, comicTitleTemplate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                                            <span>Mô tả Template</span>
                                            <span className="text-[10px] text-zinc-600 font-mono">%%title%%, %%description%%</span>
                                        </label>
                                        <textarea
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm min-h-[120px] resize-none focus:outline-none focus:border-indigo-500 transition-all"
                                            value={seo.comicDescTemplate}
                                            onChange={(e) => setSeo({ ...seo, comicDescTemplate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2 font-outfit">
                                    <FileText size={20} className="text-blue-500" /> Trang Đọc Chương
                                </h2>
                                <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-indigo-500/5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                                            <span>Tiêu đề Template Chương</span>
                                            <span className="text-[10px] text-zinc-600 font-mono">%%title%%, %%chapter%%</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                            value={seo.chapterTitleTemplate}
                                            onChange={(e) => setSeo({ ...seo, chapterTitleTemplate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Genres Tab */}
                    {activeTab === 'genres' && (
                        <div className="space-y-6 animate-fade-in animate-slide-up">
                            <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2 font-outfit">
                                <Hash size={20} className="text-emerald-500" /> Trang Thể Loại
                            </h2>
                            <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl space-y-6 shadow-2xl shadow-indigo-500/5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                                        <span>Tiêu đề Template</span>
                                        <span className="text-[10px] text-zinc-600 font-mono">%%genre%%</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                        value={seo.genreTitleTemplate}
                                        onChange={(e) => setSeo({ ...seo, genreTitleTemplate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                                        <span>Mô tả Template</span>
                                        <span className="text-[10px] text-zinc-600 font-mono">%%genre%%</span>
                                    </label>
                                    <textarea
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm min-h-[120px] resize-none focus:outline-none focus:border-indigo-500 transition-all"
                                        value={seo.genreDescTemplate}
                                        onChange={(e) => setSeo({ ...seo, genreDescTemplate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Global & Social Tab */}
                    {activeTab === 'global' && (
                        <div className="space-y-10 animate-fade-in animate-slide-up">
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2 font-outfit">
                                    <Share2 size={20} className="text-pink-500" /> Mạng xã hội & Hình ảnh
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl space-y-6 shadow-2xl shadow-indigo-500/5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                                                <ImageIcon size={16} /> URL Hình ảnh OG (Mặc định)
                                            </label>
                                            <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 transition-all" value={seo.ogImage} onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                                                <Twitter size={16} /> Twitter Handle (@username)
                                            </label>
                                            <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all" value={seo.twitterHandle} onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02] backdrop-blur-xl flex flex-col items-center justify-center space-y-4 shadow-2xl shadow-indigo-500/5">
                                        <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Xem trước hiển thị</span>
                                        <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/5 shadow-2xl relative group">
                                            <img src={seo.ogImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="OG Preview" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs font-bold text-white px-3 py-1 bg-indigo-500 rounded-full">Preview Mode</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2 font-outfit">
                                    <Globe size={20} className="text-blue-500" /> Từ khóa Toàn trang
                                </h2>
                                <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-indigo-500/5">
                                    <textarea
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm min-h-[100px] resize-none"
                                        placeholder="Ngăn cách các từ khóa bởi dấu phẩy..."
                                        value={Array.isArray(seo.globalKeywords) ? seo.globalKeywords.join(', ') : seo.globalKeywords}
                                        onChange={(e) => setSeo({ ...seo, globalKeywords: e.target.value.split(',').map((s: string) => s.trim()) })}
                                    />
                                    <p className="mt-3 text-[11px] text-zinc-500 italic">
                                        Lưu ý: Các từ khóa này sẽ xuất hiện ở cuối trang meta keywords của tất cả các trang.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Global Save Button */}
                <div className="flex justify-end sticky bottom-8 z-50">
                    <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-12 py-4 rounded-xl font-bold transition-all duration-200 active:scale-95 gap-3 text-base bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-600 disabled:opacity-50 disabled:scale-100">
                        <Save size={20} />
                        {saving ? 'Đang lưu hệ thống...' : 'Lưu tất cả cấu hình'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SeoSettings;
