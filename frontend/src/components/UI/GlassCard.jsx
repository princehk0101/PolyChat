import React from 'react';
import { twMerge } from 'tailwind-merge';

export default function GlassCard({ children, className, contentClassName, ...props }) {
    return (
        <div
            className={twMerge(
                'surface-card p-8 relative overflow-hidden',
                className
            )}
            {...props}
        >
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-accent-500/15 blur-3xl rounded-full pointer-events-none floating-orb" />
            <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-accent-100/90 blur-2xl rounded-full pointer-events-none floating-orb-fast" />

            <div className={twMerge('relative z-10', contentClassName)}>
                {children}
            </div>
        </div>
    );
}
