import React, { forwardRef, useState, useCallback } from 'react';

export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: 'default' | 'drag-drop' | 'button' | 'avatar';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    preview?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFileSelect?: (files: FileList | null) => void;
    onFileRemove?: () => void;
    fullWidth?: boolean;
    uploadText?: string;
    dragText?: string;
    removeText?: string;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
    ({
        label,
        error,
        helperText,
        variant = 'default',
        size = 'md',
        accept = 'image/*',
        multiple = false,
        maxSize = 10, // 10MB default
        preview = true,
        onChange,
        onFileSelect,
        onFileRemove,
        fullWidth = true,
        uploadText = 'Choose file',
        dragText = 'Drag and drop files here',
        removeText = 'Remove',
        className = '',
        ...props
    }, ref) => {
        const [isDragOver, setIsDragOver] = useState(false);
        const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
        const [previewUrls, setPreviewUrls] = useState<string[]>([]);

        const sizeClasses = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-3 text-base',
            lg: 'px-6 py-4 text-lg',
            xl: 'px-8 py-6 text-xl'
        };

        const handleFileChange = useCallback((files: FileList | null) => {
            if (files && files.length > 0) {
                // Check file size
                const oversizedFiles = Array.from(files).filter(file => file.size > maxSize * 1024 * 1024);
                if (oversizedFiles.length > 0) {
                    alert(`Some files exceed the maximum size of ${maxSize}MB`);
                    return;
                }

                setSelectedFiles(files);

                if (preview && accept.includes('image')) {
                    const urls = Array.from(files).map(file => URL.createObjectURL(file));
                    setPreviewUrls(urls);
                }

                if (onFileSelect) {
                    onFileSelect(files);
                }
            }
        }, [maxSize, preview, accept, onFileSelect]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFileChange(e.target.files);
            if (onChange) {
                onChange(e);
            }
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(true);
        };

        const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileChange(e.dataTransfer.files);
        };

        const handleRemove = () => {
            setSelectedFiles(null);
            setPreviewUrls([]);
            if (onFileRemove) {
                onFileRemove();
            }
        };

        const renderPreview = () => {
            if (!preview || !previewUrls.length) return null;

            if (variant === 'avatar') {
                return (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#069B93] mx-auto">
                        <img
                            src={previewUrls[0]}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                            <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            );
        };

        const renderUploadArea = (inputId: string) => {
            if (variant === 'button') {
                return (
                    <label htmlFor={inputId} className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {uploadText}
                    </label>
                );
            }

            if (variant === 'avatar') {
                return (
                    <div className="flex flex-col items-center">
                        <label htmlFor={inputId} className="cursor-pointer block w-32 h-32 rounded-full overflow-hidden border-4 border-[#069B93] hover:border-[#058a7a] transition-all duration-200 hover:shadow-lg mx-auto">
                            {selectedFiles ? (
                                <img
                                    src={previewUrls[0]}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center hover:bg-gray-300 transition-colors">
                                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs text-gray-500 font-medium">Click to upload</span>
                                </div>
                            )}
                        </label>
                        {selectedFiles && selectedFiles.length > 0 && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                                {removeText}
                            </button>
                        )}
                    </div>
                );
            }

            const dragDropClasses = `
                border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
                ${isDragOver
                    ? 'border-[#069B93] bg-[#069B93]/10'
                    : 'border-gray-300 hover:border-[#069B93] hover:bg-gray-50'
                }
                ${error ? 'border-red-300' : ''}
                ${fullWidth ? 'w-full' : ''}
                ${sizeClasses[size]}
            `;

            return (
                <label htmlFor={inputId} className={dragDropClasses}>
                    <div className="flex flex-col items-center justify-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-lg font-medium text-gray-700 mb-2">{dragText}</p>
                        <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                        <span className="inline-flex items-center px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors">
                            {uploadText}
                        </span>
                    </div>
                </label>
            );
        };

        const inputId = `file-upload-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div
                    onDragOver={variant === 'drag-drop' ? handleDragOver : undefined}
                    onDragLeave={variant === 'drag-drop' ? handleDragLeave : undefined}
                    onDrop={variant === 'drag-drop' ? handleDrop : undefined}
                >
                    <input
                        ref={ref}
                        id={inputId}
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        onChange={handleInputChange}
                        className="hidden"
                        {...props}
                    />

                    {renderUploadArea(inputId)}
                </div>

                {selectedFiles && selectedFiles.length > 0 && variant !== 'avatar' && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">
                            {selectedFiles.length} file(s) selected
                        </p>
                        {preview && renderPreview()}
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                            {removeText}
                        </button>
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

FileUpload.displayName = 'FileUpload';

export default FileUpload;
