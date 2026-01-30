import { Check } from 'lucide-react';
import React from 'react';

interface CustomCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onChange, label, description }) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left group w-full"
        >
            <div className={`
                mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
                ${checked
                    ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/40 scale-105'
                    : 'border-white/10 bg-black/40 group-hover:border-white/20'}
            `}>
                {checked && <Check size={14} className="text-white animate-in zoom-in duration-300" strokeWidth={3} />}
            </div>

            <div className="flex-1">
                {label && <div className={`text-sm font-bold transition-colors ${checked ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{label}</div>}
                {description && <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{description}</div>}
            </div>
        </button>
    );
};

export default CustomCheckbox;
