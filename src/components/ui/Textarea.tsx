import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: 'default' | 'filled' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
    rows?: number;
    maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({
        label,
        error,
        helperText,
        variant = 'outlined',
        size = 'md',
        fullWidth = true,
        resize = 'vertical',
        rows = 4,
        maxRows,
        className = '',
        ...props
    }, ref) => {
        const baseClasses = 'transition-all duration-200 focus:outline-none';

        const variantClasses = {
            default: 'border-0 border-b-2 border-gray-300 focus:border-[#069B93] bg-transparent',
            filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-[#069B93]',
            outlined: 'border-2 border-gray-200 focus:border-[#069B93] focus:ring-2 focus:ring-[#069B93]/20 bg-white'
        };

        const sizeClasses = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-3 text-base',
            lg: 'px-5 py-4 text-lg'
        };

        const resizeClasses = {
            none: 'resize-none',
            vertical: 'resize-y',
            horizontal: 'resize-x',
            both: 'resize'
        };

        const errorClasses = error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : '';

        const textareaClasses = `
            ${baseClasses}
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            ${resizeClasses[resize]}
            ${errorClasses}
            ${fullWidth ? 'w-full' : ''}
            ${className}
        `.trim();

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <textarea
                    ref={ref}
                    className={textareaClasses}
                    rows={rows}
                    {...props}
                />

                {maxRows && (
                    <div className="mt-1 text-xs text-gray-500 text-right">
                        {props.value?.toString().split('\n').length || 0} / {maxRows} lines
                    </div>
                )}

                {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p className="mt-2 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
