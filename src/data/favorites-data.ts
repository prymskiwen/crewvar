import { IFavorite, IFavoriteAlert } from "../types/favorites";

// Sample Favorites
export const sampleFavorites: IFavorite[] = [
    {
        id: "fav1",
        userId: "current_user",
        favoriteUserId: "1", // Sarah Johnson
        createdAt: "2024-01-10T10:30:00Z",
        isActive: true
    },
    {
        id: "fav2",
        userId: "current_user",
        favoriteUserId: "3", // Emma Thompson
        createdAt: "2024-01-12T14:20:00Z",
        isActive: true
    }
];

// Sample Favorite Alerts
export const sampleFavoriteAlerts: IFavoriteAlert[] = [
    {
        id: "alert1",
        userId: "current_user",
        favoriteUserId: "1",
        alertType: "same_ship",
        shipName: "Royal Caribbean Symphony of the Seas",
        port: "Miami, Florida",
        date: "2024-01-15",
        isRead: false,
        createdAt: "2024-01-15T08:00:00Z",
        message: "Sarah Johnson is on board Royal Caribbean Symphony of the Seas today — you might see each other!"
    },
    {
        id: "alert2",
        userId: "current_user",
        favoriteUserId: "3",
        alertType: "same_port",
        shipName: "Carnival Mardi Gras",
        port: "Port Canaveral, Florida",
        date: "2024-01-14",
        isRead: true,
        createdAt: "2024-01-14T07:30:00Z",
        message: "Emma Thompson is in Port Canaveral, Florida today — you're both in the same port!"
    },
    {
        id: "alert3",
        userId: "current_user",
        favoriteUserId: "1",
        alertType: "both",
        shipName: "Royal Caribbean Symphony of the Seas",
        port: "Miami, Florida",
        date: "2024-01-16",
        isRead: false,
        createdAt: "2024-01-16T09:15:00Z",
        message: "Sarah Johnson is on board Royal Caribbean Symphony of the Seas in Miami, Florida today — you're sailing together!"
    }
];

// Helper functions
export const getFavoritesForUser = (userId: string): IFavorite[] => {
    return sampleFavorites.filter(fav => fav.userId === userId && fav.isActive);
};

export const getFavoriteAlertsForUser = (userId: string): IFavoriteAlert[] => {
    return sampleFavoriteAlerts.filter(alert => alert.userId === userId);
};

export const getUnreadFavoriteAlertsCount = (userId: string): number => {
    return sampleFavoriteAlerts.filter(alert => 
        alert.userId === userId && !alert.isRead
    ).length;
};

export const addFavorite = (userId: string, favoriteUserId: string): IFavorite => {
    const newFavorite: IFavorite = {
        id: `fav_${Date.now()}`,
        userId,
        favoriteUserId,
        createdAt: new Date().toISOString(),
        isActive: true
    };
    sampleFavorites.push(newFavorite);
    return newFavorite;
};

export const removeFavorite = (userId: string, favoriteUserId: string): void => {
    const favoriteIndex = sampleFavorites.findIndex(fav => 
        fav.userId === userId && fav.favoriteUserId === favoriteUserId
    );
    if (favoriteIndex !== -1) {
        sampleFavorites[favoriteIndex].isActive = false;
    }
};

export const markFavoriteAlertAsRead = (alertId: string): void => {
    const alertIndex = sampleFavoriteAlerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
        sampleFavoriteAlerts[alertIndex].isRead = true;
    }
};

export const isUserFavorite = (userId: string, favoriteUserId: string): boolean => {
    return sampleFavorites.some(fav => 
        fav.userId === userId && fav.favoriteUserId === favoriteUserId && fav.isActive
    );
};

// Simulate checking for new alerts based on ship assignments
export const checkForNewAlerts = (userId: string): IFavoriteAlert[] => {
    const favorites = getFavoritesForUser(userId);
    const newAlerts: IFavoriteAlert[] = [];
    
    // This would normally check against real ship assignments
    // For demo purposes, we'll simulate finding a new alert
    const today = new Date().toISOString().split('T')[0];
    
    favorites.forEach(favorite => {
        // Simulate finding a favorite on the same ship today
        if (favorite.favoriteUserId === "1" && today === "2024-01-15") {
            const newAlert: IFavoriteAlert = {
                id: `alert_${Date.now()}`,
                userId,
                favoriteUserId: favorite.favoriteUserId,
                alertType: "same_ship",
                shipName: "Royal Caribbean Symphony of the Seas",
                port: "Miami, Florida",
                date: today,
                isRead: false,
                createdAt: new Date().toISOString(),
                message: "Sarah Johnson is on board Royal Caribbean Symphony of the Seas today — you might see each other!"
            };
            newAlerts.push(newAlert);
            sampleFavoriteAlerts.push(newAlert);
        }
    });
    
    return newAlerts;
};
