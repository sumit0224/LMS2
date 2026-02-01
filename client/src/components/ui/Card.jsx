import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '', ...props }) => {
    return (
        <div className={`px-6 py-4 border-b border-[var(--color-border)] ${className}`} {...props}>
            {children}
        </div>
    );
};

const CardTitle = ({ children, className = '', ...props }) => {
    return (
        <h3 className={`text-lg font-semibold text-[var(--color-text-primary)] ${className}`} {...props}>
            {children}
        </h3>
    );
};

const CardContent = ({ children, className = '', ...props }) => {
    return (
        <div className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    );
};

// Compound component pattern
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;
