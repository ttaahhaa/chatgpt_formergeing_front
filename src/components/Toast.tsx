import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastStyles = () => {
        const baseStyles = 'fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out';
        const typeStyles = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        return `${baseStyles} ${typeStyles[type]}`;
    };

    return (
        <div className={getToastStyles()}>
            <div className="flex items-center">
                {type === 'success' && <span className="mr-2">✅</span>}
                {type === 'error' && <span className="mr-2">❌</span>}
                {type === 'warning' && <span className="mr-2">⚠️</span>}
                {type === 'info' && <span className="mr-2">ℹ️</span>}
                <span>{message}</span>
            </div>
        </div>
    );
};

export default Toast; 