import { Search } from 'lucide-react';
import React from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    className = ''
}) => {
    return (
        <div className={`relative flex-1 max-w-md group ${className}`}>
            <input
                type="text"
                placeholder={placeholder}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors"
            />
        </div>
    );
};

export default SearchInput;
