import { SocialMediaData } from "./SocialMediaLinks";

interface SocialMediaDisplayProps {
    socialMedia: SocialMediaData;
    className?: string;
}

export const SocialMediaDisplay = ({ 
    socialMedia, 
    className = ""
}: SocialMediaDisplayProps) => {
    const socialMediaPlatforms = [
        {
            name: 'instagram',
            label: 'Instagram',
            icon: '📷',
            color: 'bg-gradient-to-r from-purple-500 to-pink-500',
            url: socialMedia.instagram
        },
        {
            name: 'twitter',
            label: 'X (Twitter)',
            icon: '🐦',
            color: 'bg-black',
            url: socialMedia.twitter
        },
        {
            name: 'facebook',
            label: 'Facebook',
            icon: '👥',
            color: 'bg-blue-600',
            url: socialMedia.facebook
        },
        {
            name: 'snapchat',
            label: 'Snapchat',
            icon: '👻',
            color: 'bg-yellow-400',
            url: socialMedia.snapchat
        },
        {
            name: 'website',
            label: 'Website',
            icon: '🌐',
            color: 'bg-gray-600',
            url: socialMedia.website
        }
    ];

    const availablePlatforms = socialMediaPlatforms.filter(platform => platform.url);

    if (availablePlatforms.length === 0) {
        return (
            <div className={`bg-gray-50 rounded-lg p-4 text-center ${className}`}>
                <div className="text-gray-500">
                    <div className="text-2xl mb-2">📱</div>
                    <p className="text-sm">No social media links added yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePlatforms.map((platform) => (
                    <a
                        key={platform.name}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className={`w-8 h-8 ${platform.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-sm">{platform.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                                {platform.label}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                                {platform.url}
                            </div>
                        </div>
                        <div className="text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
