import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
}

export default function LoadingSpinner({
    size = 'md',
    color = 'text-blue-600',
    className = ''
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                className={`animate-spin rounded-full border-b-2 ${color} ${sizeClasses[size]}`}
                role="status"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}
