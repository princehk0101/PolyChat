import React from 'react';
import { twMerge } from 'tailwind-merge';

export default function Input({ label, error, className, ...props }) {
    return (
        <div className="flex flex-col gap-1 w-full relative">
            {label && <label className="text-sm font-semibold text-ink-700 ml-1">{label}</label>}
            <input
                className={twMerge(
                    'bg-white/85 border border-accent-100 rounded-xl px-4 py-2.5 text-ink-950 placeholder:text-ink-400 focus:outline-none focus:border-accent-500/70 focus:ring-2 focus:ring-accent-500/20 transition-all',
                    error && 'border-red-400/80 focus:border-red-500 focus:ring-red-500/20',
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-500 mt-1 ml-1">{error}</span>}
        </div>
    );
}
