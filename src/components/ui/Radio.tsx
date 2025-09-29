import React, { forwardRef } from 'react';

export interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
    description?: string;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: RadioOption[];
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    layout?: 'vertical' | 'horizontal';
    fullWidth?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({
        label,
        error,
        helperText,
        options,
        size = 'md',
        variant = 'primary',
        layout = 'vertical',
        fullWidth = false,
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

        const radioClasses = `
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            border-gray-300 focus:ring-2 focus:ring-offset-0
            ${className}
        `.trim();

        const containerClasses = `
            ${layout === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
            ${fullWidth ? 'w-full' : ''}
        `;

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className={containerClasses}>
                    {options.map((option) => (
                        <label
                            key={option.value}
                            className={`flex items-start ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <input
                                ref={ref}
                                type="radio"
                                value={option.value}
                                disabled={option.disabled}
                                className={radioClasses}
                                {...props}
                            />

                            <div className="ml-3">
                                <span className={`text-sm font-medium ${option.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                                    {option.label}
                                </span>

                                {option.description && (
                                    <p className={`text-xs mt-1 ${option.disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {option.description}
                                    </p>
                                )}
                            </div>
                        </label>
                    ))}
                </div>

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

Radio.displayName = 'Radio';

export default Radio;
