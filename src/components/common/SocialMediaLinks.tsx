import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export interface SocialMediaData {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
    website?: string;
}

interface SocialMediaLinksProps {
    initialData?: SocialMediaData;
    onSave?: (data: SocialMediaData) => void;
    onCancel?: () => void;
    className?: string;
    showButtons?: boolean;
}

const socialMediaValidationSchema = yup.object({
    instagram: yup.string().url("Please enter a valid Instagram URL").optional(),
    twitter: yup.string().url("Please enter a valid Twitter/X URL").optional(),
    facebook: yup.string().url("Please enter a valid Facebook URL").optional(),
    snapchat: yup.string().optional(),
    website: yup.string().url("Please enter a valid website URL").optional()
}) as yup.ObjectSchema<SocialMediaData>;

export const SocialMediaLinks = ({
    initialData = {},
    onSave,
    onCancel,
    className = "",
    showButtons = true
}: SocialMediaLinksProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<SocialMediaData>({
        resolver: yupResolver(socialMediaValidationSchema),
        defaultValues: initialData
    });

    const onSubmit = async (data: SocialMediaData) => {
        setIsSubmitting(true);

        try {
            // Clean up empty strings
            const cleanedData = Object.fromEntries(
                Object.entries(data).filter(([_, value]) => value && value.trim() !== '')
            );

            onSave?.(cleanedData);
        } catch (error) {
            console.error('Failed to save social media links:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const socialMediaFields = [
        {
            name: 'instagram' as keyof SocialMediaData,
            label: 'Instagram',
            placeholder: 'https://instagram.com/yourusername',
            icon: (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
            ),
            color: 'bg-gradient-to-r from-purple-500 to-pink-500'
        },
        {
            name: 'twitter' as keyof SocialMediaData,
            label: 'X (Twitter)',
            placeholder: 'https://x.com/yourusername',
            icon: (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            ),
            color: 'bg-black'
        },
        {
            name: 'facebook' as keyof SocialMediaData,
            label: 'Facebook',
            placeholder: 'https://facebook.com/yourusername',
            icon: (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            ),
            color: 'bg-blue-600'
        },
        {
            name: 'snapchat' as keyof SocialMediaData,
            label: 'Snapchat',
            placeholder: 'your_snapchat_username',
            icon: (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
            ),
            color: 'bg-yellow-400'
        },
        {
            name: 'website' as keyof SocialMediaData,
            label: 'Personal Website',
            placeholder: 'https://yourwebsite.com',
            icon: (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"/>
                </svg>
            ),
            color: 'bg-gray-600'
        }
    ];

    return (
        <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#069B93]">Social Media Links</h2>
                    <p className="text-gray-600 mt-1">
                        Add your social media profiles to connect with other crewvar users
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {socialMediaFields.map((field) => (
                    <div key={field.name}>
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center space-x-2">
                                <div className={`w-5 h-5 ${field.color} rounded-full flex items-center justify-center`}>
                                    <span className="text-white">{field.icon}</span>
                                </div>
                                <span>{field.label}</span>
                                {field.name !== 'website' && (
                                    <span className="text-xs text-gray-500">(Optional)</span>
                                )}
                            </div>
                        </label>

                        <div className="relative">
                            <input
                                {...register(field.name)}
                                type={field.name === 'website' || field.name === 'instagram' || field.name === 'twitter' || field.name === 'facebook' ? 'url' : 'text'}
                                id={field.name}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                            />
                            <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 ${field.color} rounded-full flex items-center justify-center`}>
                                <span className="text-white">{field.icon}</span>
                            </div>
                        </div>

                        {errors[field.name] && (
                            <p className="text-red-500 text-sm mt-1">{errors[field.name]?.message}</p>
                        )}
                    </div>
                ))}

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">ℹ</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900">Privacy & Safety</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Social media links will only be visible if connection is approved. Only share links you're comfortable with others seeing.
                                You can update or remove them anytime.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {showButtons && (
                    <div className="flex space-x-4 pt-4">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};
