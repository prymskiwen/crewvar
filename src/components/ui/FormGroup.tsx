import React from 'react';

export interface FormGroupProps {
    children: React.ReactNode;
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    className?: string;
    fullWidth?: boolean;
    spacing?: 'none' | 'sm' | 'md' | 'lg';
    variant?: 'default' | 'inline' | 'stacked';
}

export const FormGroup: React.FC<FormGroupProps> = ({
    children,
    label,
    error,
    helperText,
    required = false,
    className = '',
    fullWidth = true,
    spacing = 'md',
    variant = 'default'
}) => {
    const spacingClasses = {
        none: '',
        sm: 'space-y-1',
        md: 'space-y-2',
        lg: 'space-y-4'
    };

    const variantClasses = {
        default: 'flex flex-col',
        inline: 'flex flex-row items-center space-x-4',
        stacked: 'flex flex-col space-y-2'
    };

    const containerClasses = `
        ${variantClasses[variant]}
        ${spacingClasses[spacing]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
    `.trim();

    return (
        <div className={containerClasses}>
            {label && (
                <label className="block text-sm font-semibold text-gray-800">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className={variant === 'inline' ? 'flex-1' : ''}>
                {children}
            </div>

            {error && (
                <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default FormGroup;
