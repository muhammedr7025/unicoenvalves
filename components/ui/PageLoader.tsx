import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
    message?: string;
}

export default function PageLoader({ message = 'Loading data...' }: PageLoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
            <LoadingSpinner size="lg" color="text-purple-600" />
            <p className="mt-4 text-gray-500 font-medium">{message}</p>
        </div>
    );
}
