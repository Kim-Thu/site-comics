import { AlertTriangle, X } from 'lucide-react';
import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const colorClasses = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-yellow-500 hover:bg-yellow-600',
        info: 'bg-indigo-500 hover:bg-indigo-600'
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 w-full max-w-md animate-zoom-in">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${type === 'danger' ? 'bg-red-500/10' : type === 'warning' ? 'bg-yellow-500/10' : 'bg-indigo-500/10'} flex items-center justify-center`}>
                            <AlertTriangle size={20} className={type === 'danger' ? 'text-red-500' : type === 'warning' ? 'text-yellow-500' : 'text-indigo-500'} />
                        </div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 ${colorClasses[type]} text-white rounded-xl text-sm font-bold transition-colors`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
