import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        variant = 'primary',
        size = 'md',
        fullWidth = false,
        loading = false,
        leftIcon,
        rightIcon,
        loadingText,
        className = '',
        disabled,
        ...props
    }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variantClasses = {
            primary: 'bg-[#069B93] text-white hover:bg-[#058a7a] focus:ring-[#069B93] shadow-sm hover:shadow-md',
            secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow-md',
            outline: 'border-2 border-[#069B93] text-[#069B93] hover:bg-[#069B93] hover:text-white focus:ring-[#069B93]',
            ghost: 'text-[#069B93] hover:bg-[#069B93]/10 focus:ring-[#069B93]',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
            success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md'
        };

        const sizeClasses = {
            sm: 'px-3 py-2 text-sm rounded-lg',
            md: 'px-4 py-3 text-base rounded-xl',
            lg: 'px-6 py-4 text-lg rounded-xl',
            xl: 'px-8 py-5 text-xl rounded-2xl'
        };

        const buttonClasses = `
            ${baseClasses}
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            ${fullWidth ? 'w-full' : ''}
            ${className}
        `.trim();

        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                className={buttonClasses}
                disabled={isDisabled}
                {...props}
            >
                {loading && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                )}

                {!loading && leftIcon && (
                    <span className="mr-2">{leftIcon}</span>
                )}

                <span>
                    {loading && loadingText ? loadingText : children}
                </span>

                {!loading && rightIcon && (
                    <span className="ml-2">{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
