import { Globe, Mail, Save, Settings, Share2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../store/settings.store';

const SystemSettings = () => {
    const { settings: globalSettings, fetchSettings, updateSettings, loading: storeLoading } = useSettingsStore();
    const [localSettings, setLocalSettings] = useState<any>({
        siteName: '',
        siteDomain: '',
        contactEmail: '',
        facebookUrl: '',
        discordUrl: '',
        telegramUrl: '',
        accentColor: '#6366f1'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!globalSettings) {
            fetchSettings();
        } else {
            setLocalSettings(globalSettings);
        }
    }, [globalSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateSettings(localSettings);
            toast.success('Đã cập nhật hệ thống thành công');
        } catch (error) {
            toast.error('Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (storeLoading && !globalSettings) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl space-y-8 pb-20 font-inter">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-outfit uppercase tracking-tight">Cài đặt hệ thống</h1>
                    <p className="text-zinc-500 text-sm">Quản lý các thông tin cốt lõi và kết nối mạng xã hội của Website.</p>
                </div>
                {localSettings.accentColor && (
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: localSettings.accentColor }}></div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Theme</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Core Settings */}
                <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl shadow-2xl space-y-8 font-inter">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-outfit">
                        <Settings size={20} className="text-indigo-500" /> Thông tin cơ bản
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tên Website</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm font-bold"
                                placeholder="TruyenMoi"
                                value={localSettings.siteName}
                                onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tên miền (Domain)</label>
                            <div className="relative group">
                                <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono"
                                    placeholder="truyenmoi.com"
                                    value={localSettings.siteDomain || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, siteDomain: e.target.value })}
                                />
                            </div>
                        </div>


                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Email liên hệ</label>
                            <div className="relative group">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                    placeholder="contact@truyenmoi.com"
                                    value={localSettings.contactEmail || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Settings */}
                <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 bg-white/[0.02] backdrop-blur-xl shadow-2xl space-y-8">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-outfit">
                        <Share2 size={20} className="text-pink-500" /> Kết nối mạng xã hội
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Facebook URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                    value={localSettings.facebookUrl || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, facebookUrl: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Discord Invite URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                    value={localSettings.discordUrl || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, discordUrl: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Telegram Channel/Bot</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                    value={localSettings.telegramUrl || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, telegramUrl: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center px-10 py-4 rounded-xl font-bold bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30 hover:bg-indigo-600 transition-all active:scale-95 gap-3 text-sm disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Đang lưu...' : 'Lưu cài đặt hệ thống'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SystemSettings;
