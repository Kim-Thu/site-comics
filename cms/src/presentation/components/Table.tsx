import { Loader2 } from 'lucide-react';
import React from 'react';
import EmptyState from './EmptyState';

// Main Table Container
export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`overflow-x-auto ${className}`}>
        <table className="w-full text-left border-collapse">
            {children}
        </table>
    </div>
);

// Table Header
export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <thead>
        <tr className="border-b border-white/5 bg-white/[0.02]">
            {children}
        </tr>
    </thead>
);

// Table Header Cell
export const TableHead: React.FC<{ children?: React.ReactNode; className?: string; align?: 'left' | 'center' | 'right' }> = ({
    children,
    className = '',
    align = 'left'
}) => (
    <th className={`p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-${align} ${className}`}>
        {children}
    </th>
);

// Table Body
interface TableBodyProps {
    children: React.ReactNode;
    loading?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
    colSpan?: number;
}

export const TableBody: React.FC<TableBodyProps> = ({
    children,
    loading,
    isEmpty,
    emptyMessage = 'Không có dữ liệu',
    colSpan = 1
}) => {
    if (loading) {
        return (
            <tbody>
                <tr>
                    <td colSpan={colSpan} className="p-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-indigo-500 mb-2" size={24} />
                        <p className="text-zinc-500 text-xs">Đang tải dữ liệu...</p>
                    </td>
                </tr>
            </tbody>
        );
    }

    if (isEmpty) {
        return (
            <tbody>
                <tr>
                    <td colSpan={colSpan}>
                        <EmptyState message={emptyMessage} />
                    </td>
                </tr>
            </tbody>
        );
    }

    return <tbody className="divide-y divide-white/5">{children}</tbody>;
};

// Table Row
export const TableRow: React.FC<{ children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }> = ({
    children,
    className = '',
    onClick
}) => (
    <tr
        onClick={onClick}
        className={`group hover:bg-white/[0.02] transition-colors ${className}`}
    >
        {children}
    </tr>
);

// Table Cell
export const TableCell: React.FC<{ children?: React.ReactNode; className?: string; align?: 'left' | 'center' | 'right' }> = ({
    children,
    className = '',
    align = 'left'
}) => (
    <td className={`p-4 text-${align} ${className}`}>
        {children}
    </td>
);
