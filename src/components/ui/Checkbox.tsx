import React, { forwardRef } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    fullWidth?: boolean;
    indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({
        label,
        error,
        helperText,
        size = 'md',
        variant = 'primary',
        fullWidth = false,
        indeterminate = false,
        className = '',
        ...props
    }, ref) => {
        const sizeClasses = {
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-6 h-6'
        };

        const variantClasses = {
            default: 'text-gray-600 focus:ring-gray-500',
            primary: 'text-[#069B93] focus:ring-[#069B93]',
            success: 'text-green-600 focus:ring-green-500',
            warning: 'text-yellow-600 focus:ring-yellow-500',
            danger: 'text-red-600 focus:ring-red-500'
        };

        const checkboxClasses = `
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            rounded border-gray-300 focus:ring-2 focus:ring-offset-0
            ${className}
        `.trim();

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                <label className={`flex items-start ${fullWidth ? 'w-full' : ''} ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                        ref={ref}
                        type="checkbox"
                        className={checkboxClasses}
                        {...props}
                    />

                    {label && (
                        <div className="ml-3">
                            <span className="text-sm font-medium text-gray-700">
                                {label}
                                {props.required && <span className="text-red-500 ml-1">*</span>}
                            </span>

                            {helperText && !error && (
                                <p className="text-xs text-gray-500 mt-1">{helperText}</p>
                            )}

                            {error && (
                                <p className="text-xs text-red-600 mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>
                    )}
                </label>
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
