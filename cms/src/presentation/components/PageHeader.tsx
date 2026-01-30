import React from 'react';

interface PageHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode; // For actions buttons
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">
                    {title}
                </h1>
                {description && (
                    <div className="text-zinc-400 text-xs font-medium mt-1">
                        {description}
                    </div>
                )}
            </div>
            {children && (
                <div className="flex gap-2">
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
