import { useState } from "react";
// TODO: Implement Firebase favorites functionality

interface FavoriteButtonProps {
    userId: string;
    userName: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export const FavoriteButton = ({
    userId,
    userName,
    size = 'md'
}: FavoriteButtonProps) => {
    // TODO: Implement Firebase favorites functionality
    const isFavorite = (_userId: string) => false;
    const addFavorite = (userId: string) => {
        // Placeholder function
        console.log('Adding favorite:', userId);
    };
    const removeFavorite = (userId: string) => {
        // Placeholder function
        console.log('Removing favorite:', userId);
    };
    const [isLoading, setIsLoading] = useState(false);

    const isFavorited = isFavorite(userId);

    const handleToggleFavorite = async () => {
        setIsLoading(true);

        try {
            if (isFavorited) {
                removeFavorite(userId);
            } else {
                addFavorite(userId);
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'w-6 h-6 lg:w-8 lg:h-8 text-xs lg:text-sm';
            case 'lg':
                return 'w-10 h-10 lg:w-12 lg:h-12 text-base lg:text-lg';
            default:
                return 'w-8 h-8 lg:w-10 lg:h-10 text-sm lg:text-base';
        }
    };


    return (
        <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`
                ${getSizeClasses()}
                flex items-center justify-center
                rounded-full border-2 transition-all duration-200
                ${isFavorited
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 hover:border-gray-400'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                group
            `}
            title={isFavorited ? `Remove ${userName} from favorites` : `Add ${userName} to favorites`}
        >
            {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
                <span className={`${isFavorited ? 'text-yellow-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    ⭐
                </span>
            )}
        </button>
    );
};

// Favorite Button with Text
export const FavoriteButtonWithText = ({ userId }: FavoriteButtonProps) => {
    // TODO: Implement Firebase favorites functionality
    const isFavorite = (_userId: string) => false;
    const addFavorite = (userId: string) => {
        // Placeholder function
        console.log('Adding favorite:', userId);
    };
    const removeFavorite = (userId: string) => {
        // Placeholder function
        console.log('Removing favorite:', userId);
    };
    const [isLoading, setIsLoading] = useState(false);

    const isFavorited = isFavorite(userId);

    const handleToggleFavorite = async () => {
        setIsLoading(true);

        try {
            if (isFavorited) {
                removeFavorite(userId);
            } else {
                addFavorite(userId);
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg
                border-2 transition-all duration-200 font-medium
                ${isFavorited
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                    : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
                <span className={`${isFavorited ? 'text-yellow-500' : 'text-gray-400'}`}>
                    ⭐
                </span>
            )}
            <span>
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
            </span>
        </button>
    );
};
