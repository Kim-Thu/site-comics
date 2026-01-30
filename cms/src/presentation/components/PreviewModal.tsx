import { Monitor, Smartphone, Tablet, X } from 'lucide-react';
import React, { useState } from 'react';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        title: string;
        content: string;
        featuredImage?: string;
    };
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, data }) => {
    const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    if (!isOpen) return null;

    const viewWidths = {
        desktop: 'w-full',
        tablet: 'w-[768px]',
        mobile: 'w-[375px]'
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#09090b] animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111114]">
                <div className="flex items-center gap-6">
                    <h2 className="text-lg font-bold text-white font-outfit uppercase tracking-wider">Xem trước trang</h2>
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'desktop' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('tablet')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'tablet' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <Tablet size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'mobile' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 font-mono uppercase">
                        {viewMode.toUpperCase()} VIEW
                    </span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-black p-4 flex justify-center">
                <div className={`${viewWidths[viewMode]} transition-all duration-500 bg-white text-zinc-900 rounded-lg shadow-2xl overflow-hidden flex flex-col`}>
                    {/* Fake Browser Top */}
                    <div className="h-10 bg-zinc-100 flex items-center px-4 gap-2 border-b border-zinc-200">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 max-w-sm mx-auto bg-white rounded-md h-6 border border-zinc-200 text-[10px] flex items-center px-3 text-zinc-400 font-mono">
                            https://site-comics.com/{data.title.toLowerCase().replace(/ /g, '-')}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 font-inter">
                        {data.featuredImage && (
                            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-xl">
                                <img src={data.featuredImage} className="w-full h-full object-cover" alt="" />
                            </div>
                        )}
                        <h1 className="text-4xl font-extrabold mb-6 leading-tight text-zinc-950">{data.title || 'Tiêu đề trang'}</h1>
                        <div
                            className="prose prose-zinc max-w-none prose-img:rounded-2xl"
                            dangerouslySetInnerHTML={{ __html: data.content || '<p class="text-zinc-400 italic">Chưa có nội dung...</p>' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
