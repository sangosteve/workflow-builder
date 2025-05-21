import React from 'react';

interface BaseNodeProps {
    className?: string;
    children: React.ReactNode;
}

export const BaseNode = ({ className = '', children }: BaseNodeProps) => {
    return (
        <div
            className={`bg-white rounded shadow p-3 border border-gray-300 w-[320px] ${className}`}
        >
            {children}
        </div>
    );
};
