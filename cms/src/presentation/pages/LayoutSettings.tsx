import { ImageIcon, Layout, Palette, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { comicService, settingService } from '../../infrastructure/api.service';

const LayoutSettings = () => {
    const [settings, setSettings] = useState<any>({
        logo: '',
        favicon: '',
        accentColor: '#6366f1',
        footerText: '',
        showSidebar: true,
        itemsPerPage: 20
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState({ logo: false, favicon: false });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await settingService.getSettings();
            setSettings(data);
        } catch (error) {
            toast.error('Không thể lấy cấu hình giao diện');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await settingService.updateSettings(settings);

            // Apply new theme color immediately
            if (settings.accentColor) {
                const hex = settings.accentColor;
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                if (result) {
                    const r = parseInt(result[1], 16);
                    const g = parseInt(result[2], 16);
                    const b = parseInt(result[3], 16);

                    const toHex = (n: number) => n.toString(16).padStart(2, '0');
                    const dr = Math.max(0, Math.floor(r * 0.8));
                    const dg = Math.max(0, Math.floor(g * 0.8));
                    const db = Math.max(0, Math.floor(b * 0.8));
                    const lr = Math.min(255, Math.floor(r * 1.2));
                    const lg = Math.min(255, Math.floor(g * 1.2));
                    const lb = Math.min(255, Math.floor(b * 1.2));

                    const root = document.documentElement;
                    root.style.setProperty('--primary', hex);
                    root.style.setProperty('--primary-dark', `#${toHex(dr)}${toHex(dg)}${toHex(db)}`);
                    root.style.setProperty('--primary-light', `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`);
                }
            }

            toast.success('Đã cập nhật cấu hình giao diện thành công');
        } catch (error) {
            toast.error('Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const res = await comicService.uploadImage(file);
            setSettings({ ...settings, [type]: res.url });
            toast.success(`Đã tải ${type} lên thành công`);
        } catch (error) {
            toast.error(`Tải ${type} thất bại`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl space-y-8 pb-20 font-inter">
            <div>
                <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-outfit uppercase tracking-tight">Giao diện & Bố cục</h1>
                <p className="text-zinc-500 text-sm">Tùy chỉnh nhận diện thương hiệu và cách hiển thị của Website.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Branding Section */}
                <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl shadow-2xl space-y-8">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-outfit">
                        <Palette size={20} className="text-indigo-500" /> Nhận diện thương hiệu
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Logo Upload */}
                        <div className="space-y-4 text-center md:text-left">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block pl-1">Logo Website</label>
                            <div className="relative inline-block w-full max-w-[200px] aspect-[3/1] bg-white/[0.02] border-2 border-dashed border-white/10 rounded-xl overflow-hidden group transition-all hover:border-indigo-500/40">
                                {settings.logo ? (
                                    <img src={settings.logo} className="w-full h-full object-contain p-2" alt="Logo" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                                        <ImageIcon size={24} className="mb-1 opacity-20" />
                                        <span className="text-[10px] uppercase font-black opacity-40">Logo</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-indigo-500/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px]">
                                    <span className="text-white text-[10px] font-black uppercase">Thay đổi</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                </label>
                                {uploading.logo && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-zinc-600">Khuyên dùng file PNG trong suốt, chiều cao 60px.</p>
                        </div>

                        {/* Favicon Upload */}
                        <div className="space-y-4 text-center md:text-left">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block pl-1">Favicon (Biểu tượng)</label>
                            <div className="relative inline-block w-16 h-16 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-xl overflow-hidden group transition-all hover:border-indigo-500/40">
                                {settings.favicon ? (
                                    <img src={settings.favicon} className="w-full h-full object-contain p-2" alt="Favicon" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                                        <ImageIcon size={20} className="opacity-20" />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-indigo-500/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px]">
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} />
                                    <span className="text-white text-[10px] font-black uppercase">Đổi</span>
                                </label>
                                {uploading.favicon && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-zinc-600">File ICO hoặc PNG (32x32px).</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Màu sắc chủ đạo (Accent Color)</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white/10 hover:scale-105 transition-transform">
                                <input
                                    type="color"
                                    className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 p-0 border-0 cursor-pointer"
                                    value={settings.accentColor}
                                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                                />
                            </div>
                            <input
                                type="text"
                                className="w-32 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all uppercase"
                                value={settings.accentColor}
                                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Layout Section */}
                <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl shadow-2xl space-y-8">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-outfit">
                        <Layout size={20} className="text-purple-500" /> Bố cục & Hiển thị
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block pl-1">Số truyện mỗi trang</label>
                            <input
                                type="number"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm font-bold"
                                value={settings.itemsPerPage}
                                onChange={(e) => setSettings({ ...settings, itemsPerPage: Number(e.target.value) })}
                            />
                        </div>

                        <div className="flex items-center gap-4 pt-8">
                            <div className="relative flex items-center h-5 w-5">
                                <input
                                    id="show-sidebar"
                                    type="checkbox"
                                    className="peer absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                    checked={settings.showSidebar}
                                    onChange={(e) => setSettings({ ...settings, showSidebar: e.target.checked })}
                                />
                                <div className="h-5 w-5 rounded-md border-2 border-white/10 bg-white/5 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 peer-checked:[&>svg]:opacity-100 transition-all flex items-center justify-center pointer-events-none">
                                    <svg className="w-3.5 h-3.5 text-white opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <label htmlFor="show-sidebar" className="text-sm font-bold text-zinc-300 cursor-pointer uppercase tracking-tight">Hiển thị Sidebar trang người dùng</label>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Văn bản chân trang (Footer Text)</label>
                            <textarea
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm min-h-[80px] resize-none"
                                value={settings.footerText}
                                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                                placeholder="VD: © 2026 TruyenMoi. All rights reserved."
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center px-10 py-4 rounded-xl font-bold bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30 hover:bg-indigo-600 transition-all active:scale-95 gap-3 text-sm disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Đang lưu...' : 'Lưu cấu hình giao diện'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LayoutSettings;
