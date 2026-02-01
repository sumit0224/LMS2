import React from 'react';

const Input = ({
    label,
    type = 'text',
    error,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    id={id}
                    className={`
                        block w-full px-4 py-2.5 
                        bg-white border text-[var(--color-text-primary)] rounded-lg shadow-sm
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                        transition-all duration-200
                        ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : 'border-[var(--color-border)]'}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>
            )}
        </div>
    );
};

export default Input;
