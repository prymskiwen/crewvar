import React, { useState, useEffect, useRef } from 'react';

export interface AutocompleteOption {
    id: string;
    name: string;
    value?: any; // Optional additional data
}

export interface AutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    options: AutocompleteOption[];
    placeholder: string;
    loading?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    searchPlaceholder?: string;
    noOptionsText?: string;
    maxHeight?: string;
    allowClear?: boolean;
    onClear?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
    value,
    onChange,
    options,
    placeholder,
    loading = false,
    disabled = false,
    error,
    className = '',
    searchPlaceholder = 'Search...',
    noOptionsText = 'No options available',
    maxHeight = '200px',
    allowClear = false,
    onClear,
    onFocus,
    onBlur
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(option => option.id === value);

    const handleOptionClick = (optionId: string) => {
        onChange(optionId);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        onChange('');
        if (onClear) onClear();
    };

    const handleFocus = () => {
        if (onFocus) onFocus();
    };

    const handleBlur = () => {
        if (onBlur) onBlur();
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border-2 rounded-xl text-left transition-all duration-200 ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-[#069B93] focus:ring-[#069B93]'
                    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-[#069B93]'}`}
            >
                <div className="flex items-center justify-between">
                    <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                        {loading ? 'Loading...' : selectedOption ? selectedOption.name : placeholder}
                    </span>
                    <div className="flex items-center space-x-2">
                        {loading && (
                            <div className="w-4 h-4 border-2 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {allowClear && value && !loading && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClear();
                                }}
                                className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                        <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#069B93] focus:border-transparent"
                        />
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight }}>
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-center">
                                {searchTerm ? 'No options found' : noOptionsText}
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleOptionClick(option.id)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                                >
                                    <span>{option.name}</span>
                                    {option.id === value && (
                                        <svg className="w-4 h-4 text-[#069B93]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
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
        </div>
    );
};

export default Autocomplete;
