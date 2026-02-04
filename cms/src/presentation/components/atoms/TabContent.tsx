import React from 'react';

interface TabContentProps {
    id: string;
    activeTab: string;
    children: React.ReactNode;
    className?: string;
}

const TabContent: React.FC<TabContentProps> = ({ id, activeTab, children, className = '' }) => {
    if (activeTab !== id) return null;

    return (
        <div className={`animate-in fade-in zoom-in-95 duration-200 ${className}`}>
            {children}
        </div>
    );
};

export default TabContent;
