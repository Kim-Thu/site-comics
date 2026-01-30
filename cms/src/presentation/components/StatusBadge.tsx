import React from 'react';

type StatusType = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED' | string;

interface StatusBadgeProps {
    status: StatusType;
    pulse?: boolean;
    labels?: Record<string, string>;
}

const defaultLabels: Record<string, string> = {
    'ACTIVE': 'Đang hoạt động',
    'INACTIVE': 'Không hoạt động',
    'BANNED': 'Đã bị cấm',
    'ONGOING': 'Đang tiến hành',
    'COMPLETED': 'Hoàn thành',
    'HIATUS': 'Tạm ngưng',
    'CANCELLED': 'Đã hủy'
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, pulse = false, labels = defaultLabels }) => {
    const s = status.toUpperCase();

    let colorClass = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    let dotColor = 'bg-zinc-500';

    if (s === 'ACTIVE' || s === 'COMPLETED') {
        colorClass = 'bg-green-500/10 text-green-400 border-green-500/20';
        dotColor = 'bg-green-500';
    } else if (s === 'BANNED' || s === 'CANCELLED') {
        colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
        dotColor = 'bg-red-500';
    } else if (s === 'ONGOING' || s === 'HIATUS') {
        colorClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        dotColor = 'bg-indigo-500';
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
            {pulse && <div className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`}></div>}
            {labels[s] || status}
        </div>
    );
};

export default StatusBadge;
