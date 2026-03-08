import React from 'react';
import { twMerge } from 'tailwind-merge';

export default function Button({ children, className, variant = 'primary', ...props }) {
    const variants = {
        primary: 'bg-accent-700 text-white border border-accent-700 hover:bg-accent-600',
        secondary: 'bg-white text-ink-950 border border-accent-200 hover:bg-accent-100',
        ghost: 'bg-transparent text-ink-600 border border-transparent hover:bg-accent-100',
    };

    return (
        <button
            className={twMerge(
                'px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
