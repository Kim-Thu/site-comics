import { AlertCircle, CheckCircle2, Facebook, Globe, Image as ImageIcon, Search, Twitter, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import Button from './atoms/Button';
import MediaPickerModal from './MediaPickerModal';

interface SEOData {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
}

interface SEOManagerProps {
    data: SEOData;
    onChange: (data: SEOData) => void;
    defaultTitle?: string;
    defaultDescription?: string;
    slug?: string;
    baseUrl?: string;
}

const SEOManager: React.FC<SEOManagerProps> = ({
    data,
    onChange,
    defaultTitle = '',
    defaultDescription = '',
    slug = '',
    baseUrl = 'https://example.com'
}) => {
    const [activeTab, setActiveTab] = useState<'general' | 'facebook' | 'twitter'>('general');
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [pickingFor, setPickingFor] = useState<'og' | 'twitter' | 'general'>('general');

    const handleFieldChange = (field: keyof SEOData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const openMediaPicker = (target: 'og' | 'twitter' | 'general') => {
        setPickingFor(target);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (url: string) => {
        if (pickingFor === 'og') handleFieldChange('ogImage', url);
        else if (pickingFor === 'twitter') handleFieldChange('twitterImage', url);
        else handleFieldChange('ogImage', url); // default to ogImage for general if needed
        setShowMediaPicker(false);
    };

    // SEO Analysis Logic
    const titleLength = (data.metaTitle || defaultTitle).length;
    const descLength = (data.metaDescription || defaultDescription).length;
    const hasImage = !!(data.ogImage || data.twitterImage);

    const analysis = [
        {
            label: 'Độ dài tiêu đề',
            score: titleLength >= 40 && titleLength <= 60,
            message: titleLength < 40 ? 'Tiêu đề quá ngắn (nên từ 40-60 ký tự)' : titleLength > 60 ? 'Tiêu đề quá dài (nên từ 40-60 ký tự)' : 'Độ dài tiêu đề tốt'
        },
        {
            label: 'Độ dài mô tả',
            score: descLength >= 120 && descLength <= 160,
            message: descLength < 120 ? 'Mô tả quá ngắn (nên từ 120-160 ký tự)' : descLength > 160 ? 'Mô tả quá dài (nên từ 120-160 ký tự)' : 'Độ dài mô tả tốt'
        },
        {
            label: 'Hình ảnh SEO',
            score: hasImage,
            message: hasImage ? 'Đã có hình ảnh SEO' : 'Chưa có hình ảnh SEO'
        },
        {
            label: 'Từ khóa chính',
            score: !!data.focusKeyword,
            message: data.focusKeyword ? 'Đã thiết lập từ khóa chính' : 'Chưa có từ khóa chính'
        }
    ];

    const scorePercentage = Math.round((analysis.filter(a => a.score).length / analysis.length) * 100);
    const scoreColor = scorePercentage > 70 ? 'text-emerald-500' : scorePercentage > 40 ? 'text-yellow-500' : 'text-red-500';
    const scoreBg = scorePercentage > 70 ? 'bg-emerald-500' : scorePercentage > 40 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="bg-[#111114] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
            {/* SEO Header */}
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                        <Search size={20} className="text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white font-outfit">Tối ưu hóa SEO</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${scoreColor}`}>
                                {scorePercentage > 70 ? 'Tốt' : scorePercentage > 40 ? 'Trung bình' : 'Kém'}
                            </span>
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${scoreBg}`}
                                    style={{ width: `${scorePercentage}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500">{scorePercentage}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-black/20 border-b border-white/[0.05]">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'general' ? 'bg-white/5 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Globe size={14} /> General
                </button>
                <button
                    onClick={() => setActiveTab('facebook')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'facebook' ? 'bg-white/5 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Facebook size={14} /> Facebook
                </button>
                <button
                    onClick={() => setActiveTab('twitter')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'twitter' ? 'bg-white/5 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Twitter size={14} /> Twitter
                </button>
            </div>

            <div className="p-8 space-y-8">
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Meta Title */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Meta Title ({titleLength}/60)</label>
                                {titleLength > 60 && <AlertCircle size={14} className="text-red-500" />}
                            </div>
                            <input
                                type="text"
                                value={data.metaTitle || ''}
                                onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
                                placeholder={defaultTitle}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:bg-white/[0.05] outline-none transition-all"
                            />
                        </div>

                        {/* Meta Description */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Meta Description ({descLength}/160)</label>
                                {descLength > 160 && <AlertCircle size={14} className="text-red-500" />}
                            </div>
                            <textarea
                                value={data.metaDescription || ''}
                                onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                                placeholder={defaultDescription}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 min-h-[100px] focus:border-indigo-500/50 focus:bg-white/[0.05] outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Focus Keyword */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Từ khóa chính (Focus Keyword)</label>
                            <input
                                type="text"
                                value={data.focusKeyword || ''}
                                onChange={(e) => handleFieldChange('focusKeyword', e.target.value)}
                                placeholder="Nhập từ khóa chính để phân tích..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                            />
                        </div>

                        {/* SEO Image */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SEO Image (Open Graph)</label>
                            {data.ogImage ? (
                                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                                    <img src={data.ogImage} className="w-full h-full object-cover" alt="SEO Preview" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => openMediaPicker('og')}>Thay đổi</Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleFieldChange('ogImage', '')} className="text-red-400">Xóa</Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => openMediaPicker('og')}
                                    className="w-full aspect-video border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 text-zinc-600 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                                >
                                    <ImageIcon size={32} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Click to upload custom SEO image</span>
                                </button>
                            )}
                        </div>

                        {/* Google Preview */}
                        <div className="space-y-3 pt-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={12} /> Google Preview
                            </label>
                            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 space-y-1 shadow-inner">
                                <div className="text-xs text-zinc-500 truncate mb-1">{baseUrl}/{slug}</div>
                                <div className="text-lg font-medium text-[#8ab4f8] hover:underline cursor-pointer truncate">
                                    {data.metaTitle || defaultTitle || 'Thiết lập tiêu đề meta...'}
                                </div>
                                <div className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                                    {data.metaDescription || defaultDescription || 'Thiết lập mô tả meta để xem trước kết quả tìm kiếm của bạn ở đây...'}
                                </div>
                            </div>
                        </div>

                        {/* Analysis List */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phân tích SEO</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {analysis.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.03]">
                                        {item.score ? (
                                            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                                        ) : (
                                            <XCircle size={16} className="text-red-500 flex-shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-zinc-300">{item.label}</div>
                                            <div className="text-[10px] text-zinc-500 truncate">{item.message}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'facebook' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Facebook Title</label>
                            <input
                                type="text"
                                value={data.ogTitle || ''}
                                onChange={(e) => handleFieldChange('ogTitle', e.target.value)}
                                placeholder={data.metaTitle || defaultTitle}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Facebook Description</label>
                            <textarea
                                value={data.ogDescription || ''}
                                onChange={(e) => handleFieldChange('ogDescription', e.target.value)}
                                placeholder={data.metaDescription || defaultDescription}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 min-h-[100px] focus:border-indigo-500/50 outline-none transition-all resize-none"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Facebook Image</label>
                            <div
                                onClick={() => openMediaPicker('og')}
                                className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-white/5 bg-white/[0.02] flex items-center justify-center cursor-pointer hover:border-indigo-500/30 transition-all group"
                            >
                                {data.ogImage ? (
                                    <img src={data.ogImage} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <ImageIcon size={32} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'twitter' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Twitter Title</label>
                            <input
                                type="text"
                                value={data.twitterTitle || ''}
                                onChange={(e) => handleFieldChange('twitterTitle', e.target.value)}
                                placeholder={data.metaTitle || defaultTitle}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Twitter Description</label>
                            <textarea
                                value={data.twitterDescription || ''}
                                onChange={(e) => handleFieldChange('twitterDescription', e.target.value)}
                                placeholder={data.metaDescription || defaultDescription}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 min-h-[100px] focus:border-indigo-500/50 outline-none transition-all resize-none"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Twitter Image</label>
                            <div
                                onClick={() => openMediaPicker('twitter')}
                                className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-white/5 bg-white/[0.02] flex items-center justify-center cursor-pointer hover:border-indigo-500/30 transition-all group"
                            >
                                {data.twitterImage || data.ogImage ? (
                                    <img src={data.twitterImage || data.ogImage} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <ImageIcon size={32} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleMediaSelect}
                title="Chọn ảnh SEO"
            />
        </div>
    );
};

export default SEOManager;
