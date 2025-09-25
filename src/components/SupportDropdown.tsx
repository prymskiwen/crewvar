import React, { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi';

interface SupportDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    disabled?: boolean;
    label: string;
    required?: boolean;
}

const SupportDropdown = ({ 
    value, 
    onChange, 
    options, 
    placeholder = "Select an option", 
    disabled = false, 
    label,
    required = false
}: SupportDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionClick = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                onClick={handleInputClick}
                onKeyDown={handleKeyDown}
                className={`
                    w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-[#069B93] focus:border-transparent 
                    text-sm sm:text-base cursor-pointer
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
                    ${isOpen ? 'ring-2 ring-[#069B93] border-[#069B93]' : ''}
                `}
                tabIndex={disabled ? -1 : 0}
            >
                <div className="flex items-center justify-between">
                    <span className={`${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <HiChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`} 
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleOptionClick(option.value)}
                            className={`
                                px-3 sm:px-4 py-2 sm:py-3 cursor-pointer text-sm sm:text-base
                                hover:bg-gray-100 transition-colors
                                ${value === option.value ? 'bg-[#069B93]/10 text-[#069B93] font-medium' : 'text-gray-900'}
                            `}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SupportDropdown;
