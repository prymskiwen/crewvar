import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IFavorite, IFavoriteAlert, IFavoriteContext } from "../types/favorites";
import { 
    getFavoritesForUser, 
    getFavoriteAlertsForUser, 
    getUnreadFavoriteAlertsCount,
    addFavorite as addFavoriteData,
    removeFavorite as removeFavoriteData,
    markFavoriteAlertAsRead as markAlertAsReadData,
    isUserFavorite,
    checkForNewAlerts
} from "../data/favorites-data";

const FavoritesContext = createContext<IFavoriteContext | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

interface FavoritesProviderProps {
    children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
    const [favorites, setFavorites] = useState<IFavorite[]>([]);
    const [alerts, setAlerts] = useState<IFavoriteAlert[]>([]);
    const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

    // Load initial data
    useEffect(() => {
        const userId = "current_user";
        setFavorites(getFavoritesForUser(userId));
        setAlerts(getFavoriteAlertsForUser(userId));
        setUnreadAlertsCount(getUnreadFavoriteAlertsCount(userId));
    }, []);

    // Check for new alerts periodically (simulate real-time checking)
    useEffect(() => {
        const checkAlerts = () => {
            const userId = "current_user";
            const newAlerts = checkForNewAlerts(userId);
            if (newAlerts.length > 0) {
                setAlerts(prev => [...prev, ...newAlerts]);
                setUnreadAlertsCount(prev => prev + newAlerts.length);
            }
        };

        // Check every 5 minutes (in real app, this would be server-pushed)
        const interval = setInterval(checkAlerts, 5 * 60 * 1000);
        
        // Initial check
        checkAlerts();

        return () => clearInterval(interval);
    }, []);

    const addFavorite = (userId: string) => {
        const userId_current = "current_user";
        const newFavorite = addFavoriteData(userId_current, userId);
        setFavorites(prev => [...prev, newFavorite]);
        console.log(`Added ${userId} to favorites`);
    };

    const removeFavorite = (userId: string) => {
        const userId_current = "current_user";
        removeFavoriteData(userId_current, userId);
        setFavorites(prev => prev.filter(fav => fav.favoriteUserId !== userId));
        console.log(`Removed ${userId} from favorites`);
    };

    const markAlertAsRead = (alertId: string) => {
        markAlertAsReadData(alertId);
        setAlerts(prev => 
            prev.map(alert => 
                alert.id === alertId ? { ...alert, isRead: true } : alert
            )
        );
        setUnreadAlertsCount(prev => Math.max(0, prev - 1));
    };

    const checkForAlerts = () => {
        const userId = "current_user";
        const newAlerts = checkForNewAlerts(userId);
        if (newAlerts.length > 0) {
            setAlerts(prev => [...prev, ...newAlerts]);
            setUnreadAlertsCount(prev => prev + newAlerts.length);
        }
    };

    const isFavorite = (userId: string): boolean => {
        return isUserFavorite("current_user", userId);
    };

    const value: IFavoriteContext = {
        favorites,
        alerts,
        unreadAlertsCount,
        addFavorite,
        removeFavorite,
        markAlertAsRead,
        checkForAlerts,
        isFavorite
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
