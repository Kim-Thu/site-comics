import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    label?: string;
    placeholder?: string;
    minimal?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    onChange,
    options,
    label,
    placeholder = 'Chọn...',
    minimal = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    if (minimal) {
        return (
            <div ref={selectRef} className="relative inline-block">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors outline-none"
                >
                    <span>{selectedOption?.label || placeholder}</span>
                    <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="absolute z-[100] right-0 mt-1 min-w-[120px] bg-[#1a1a1d] border border-white/10 rounded-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-colors ${value === option.value
                                    ? 'bg-indigo-500 text-white'
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={selectRef} className="relative">
            {label && (
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:border-indigo-500 outline-none transition-colors flex items-center justify-between hover:bg-black/30"
            >
                <span className={selectedOption ? 'text-zinc-300' : 'text-zinc-500'}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#1a1a1d] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
                    <div className="max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${value === option.value
                                    ? 'bg-indigo-500/20 text-indigo-400 font-medium'
                                    : 'text-zinc-300 hover:bg-white/5'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
