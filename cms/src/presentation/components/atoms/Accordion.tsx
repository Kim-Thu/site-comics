import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

interface AccordionProps {
    title: string;
    count?: number;
    defaultOpen?: boolean;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
    title,
    count,
    defaultOpen = true,
    children,
    actions
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0c]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <ChevronDown
                        size={18}
                        className={`text-zinc-500 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                    />
                    <h3 className="text-sm font-bold text-zinc-200">{title}</h3>
                    {count !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 text-xs font-medium">
                            {count}
                        </span>
                    )}
                </div>
                {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
            </button>

            {isOpen && (
                <div className="p-4 border-t border-white/5 animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
