import { LucideIcon, Search } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
    icon?: LucideIcon;
    message?: string;
    subMessage?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon = Search,
    message = 'Không tìm thấy dữ liệu',
    subMessage
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-zinc-500 gap-3">
            <Icon size={48} className="opacity-20" />
            <div className="text-center">
                <p className="text-sm font-medium">{message}</p>
                {subMessage && <p className="text-xs pt-1 opacity-70">{subMessage}</p>}
            </div>
        </div>
    );
};

export default EmptyState;
