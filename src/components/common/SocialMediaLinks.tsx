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
    className = ""
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
            icon: '📷',
            color: 'bg-gradient-to-r from-purple-500 to-pink-500'
        },
        {
            name: 'twitter' as keyof SocialMediaData,
            label: 'X (Twitter)',
            placeholder: 'https://x.com/yourusername',
            icon: '🐦',
            color: 'bg-black'
        },
        {
            name: 'facebook' as keyof SocialMediaData,
            label: 'Facebook',
            placeholder: 'https://facebook.com/yourusername',
            icon: '👥',
            color: 'bg-blue-600'
        },
        {
            name: 'snapchat' as keyof SocialMediaData,
            label: 'Snapchat',
            placeholder: 'your_snapchat_username',
            icon: '👻',
            color: 'bg-yellow-400'
        },
        {
            name: 'website' as keyof SocialMediaData,
            label: 'Personal Website',
            placeholder: 'https://yourwebsite.com',
            icon: '🌐',
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
                                <span className="text-lg">{field.icon}</span>
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
                                <span className="text-white text-xs">{field.icon}</span>
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
            </form>
        </div>
    );
};
