import { Check, Image as ImageIcon, Search, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../infrastructure/api.service';

interface Media {
    id: string;
    url: string;
    filename: string;
    caption?: string;
    alt?: string;
}

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    title?: string;
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    title = 'Chọn hình ảnh'
}) => {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen, page, search]);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/media', {
                params: { page, limit: 12, search }
            });
            setMedia(data.data);
            setTotalPages(data.meta.last_page);
        } catch (error) {
            toast.error('Không tải được thư viện ảnh');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const { data } = await api.post('/media/upload', formData);
            toast.success('Upload thành công');
            setSelectedUrl(data.url);
            fetchMedia();
        } catch (error) {
            toast.error('Upload thất bại');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleConfirm = () => {
        if (selectedUrl) {
            onSelect(selectedUrl);
            onClose();
            setSelectedUrl(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#111114] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col animate-zoom-in">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Search & Upload */}
                <div className="p-4 border-b border-white/10 flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm ảnh..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <label className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all
                        ${uploading ? 'bg-indigo-500/50 cursor-wait' : 'bg-indigo-500 hover:bg-indigo-600'}
                        text-white
                    `}>
                        <Upload size={16} />
                        {uploading ? 'Đang tải...' : 'Tải lên'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>

                {/* Media Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-zinc-500">Đang tải...</div>
                    ) : media.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
                            <ImageIcon size={48} className="opacity-20" />
                            <p>Chưa có hình ảnh nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {media.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedUrl(item.url)}
                                    className={`
                                        group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                                        ${selectedUrl === item.url
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-95'
                                            : 'border-white/5 hover:border-white/20'
                                        }
                                    `}
                                >
                                    <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />
                                    {selectedUrl === item.url && (
                                        <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                                <Check size={16} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[10px] text-white truncate">{item.filename}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/10 flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded-lg border border-white/10 text-zinc-400 hover:text-white disabled:opacity-50 text-sm"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1 text-zinc-500 text-sm">Trang {page} / {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded-lg border border-white/10 text-zinc-400 hover:text-white disabled:opacity-50 text-sm"
                        >
                            Sau
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedUrl}
                        className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors"
                    >
                        Chọn ảnh
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaPickerModal;
