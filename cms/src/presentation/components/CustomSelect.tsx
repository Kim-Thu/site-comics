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
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    onChange,
    options,
    label,
    placeholder = 'Chọn...'
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
