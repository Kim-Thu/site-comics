import { X } from 'lucide-react';
import React, { useState } from 'react';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void;
    title: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    submitText?: string;
    cancelText?: string;
}

const InputModal: React.FC<InputModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    label,
    placeholder = '',
    defaultValue = '',
    submitText = 'Xác nhận',
    cancelText = 'Hủy'
}) => {
    const [value, setValue] = useState(defaultValue);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(value.trim());
            setValue('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 w-full max-w-md animate-zoom-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">{label}</label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={placeholder}
                            autoFocus
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:border-indigo-500 outline-none transition-colors"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            disabled={!value.trim()}
                            className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors"
                        >
                            {submitText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InputModal;
