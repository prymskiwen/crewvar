import { IConnectionRequest, IConnection, IUserProfile, INotification, IConnectionContext } from "../types/connections";
import { defaultAvatar } from "../utils/images";

// Sample User Profiles
export const sampleProfiles: IUserProfile[] = [
    {
        id: "1",
        displayName: "Sarah Johnson",
        avatar: defaultAvatar,
        role: "Head Waiter",
        department: "Food & Beverage",
        subcategory: "Restaurant Service",
        shipName: "Royal Caribbean Symphony of the Seas",
        port: "Miami, Florida",
        bio: "Passionate about creating memorable dining experiences for our guests. Love connecting with fellow crew members!",
        photos: [
            "/src/assets/images/Home/default-avatar.webp",
            "/src/assets/images/Home/default-avatar.webp"
        ],
        contacts: {
            email: "sarah.johnson@crew.com",
            social: ["@sarahcruise"]
        },
        isOnline: true,
        lastSeen: "2 minutes ago"
    },
    {
        id: "2",
        displayName: "Mike Rodriguez",
        avatar: defaultAvatar,
        role: "Bartender",
        department: "Food & Beverage",
        subcategory: "Bar Service",
        shipName: "Carnival Mardi Gras",
        port: "Port Canaveral, Florida",
        bio: "Mixologist with 5 years experience. Always up for a good conversation and making new friends onboard!",
        isOnline: false,
        lastSeen: "1 hour ago"
    },
    {
        id: "3",
        displayName: "Emma Thompson",
        avatar: defaultAvatar,
        role: "Cruise Director",
        department: "Entertainment",
        subcategory: "Activities",
        shipName: "Norwegian Encore",
        port: "Seattle, Washington",
        bio: "Bringing joy and entertainment to every voyage. Let's make this cruise unforgettable together!",
        photos: [
            "/src/assets/images/Home/default-avatar.webp"
        ],
        isOnline: true,
        lastSeen: "Online now"
    }
];

// Sample Connection Requests
export const sampleConnectionRequests: IConnectionRequest[] = [
    {
        id: "req1",
        fromUserId: "current_user",
        toUserId: "1",
        status: "pending",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        message: "Hi Sarah! I saw you're also in Food & Beverage. Would love to connect!"
    },
    {
        id: "req2",
        fromUserId: "2",
        toUserId: "current_user",
        status: "pending",
        createdAt: "2024-01-15T09:15:00Z",
        updatedAt: "2024-01-15T09:15:00Z",
        message: "Hey! I'm Mike from Bar Service. Let's connect!"
    }
];

// Sample Connections
export const sampleConnections: IConnection[] = [
    {
        id: "conn1",
        userId1: "current_user",
        userId2: "3",
        createdAt: "2024-01-10T14:20:00Z",
        status: "active"
    }
];

// Sample Notifications
export const sampleNotifications: INotification[] = [
    {
        id: "notif1",
        userId: "current_user",
        type: "connection_request",
        title: "New Connection Request",
        message: "Mike Rodriguez wants to connect with you",
        isRead: false,
        createdAt: "2024-01-15T09:15:00Z",
        data: { requestId: "req2", fromUserId: "2" }
    },
    {
        id: "notif2",
        userId: "current_user",
        type: "connection_accepted",
        title: "Connection Accepted",
        message: "Emma Thompson accepted your connection request",
        isRead: true,
        createdAt: "2024-01-10T14:25:00Z",
        data: { connectionId: "conn1", userId: "3" }
    }
];

// Sample Connection Context
export const sampleConnectionContext: IConnectionContext = {
    mutualFriends: 3,
    mutualFriendsNames: ["Alex Chen", "Lisa Park", "David Wilson"],
    pastCoincidences: [
        {
            ship: "Royal Caribbean Symphony of the Seas",
            port: "Miami, Florida",
            date: "December 2023"
        },
        {
            ship: "Carnival Mardi Gras",
            port: "Port Canaveral, Florida",
            date: "November 2023"
        }
    ]
};

// Helper functions
export const getConnectionRequestsForUser = (userId: string): IConnectionRequest[] => {
    return sampleConnectionRequests.filter(req => 
        req.fromUserId === userId || req.toUserId === userId
    );
};

export const getPendingRequestsForUser = (userId: string): IConnectionRequest[] => {
    return sampleConnectionRequests.filter(req => 
        req.toUserId === userId && req.status === 'pending'
    );
};

export const getSentRequestsForUser = (userId: string): IConnectionRequest[] => {
    return sampleConnectionRequests.filter(req => 
        req.fromUserId === userId && req.status === 'pending'
    );
};

export const getConnectionsForUser = (userId: string): IConnection[] => {
    return sampleConnections.filter(conn => 
        conn.userId1 === userId || conn.userId2 === userId
    );
};

export const getNotificationsForUser = (userId: string): INotification[] => {
    return sampleNotifications.filter(notif => notif.userId === userId);
};

export const getUnreadNotificationsCount = (userId: string): number => {
    return sampleNotifications.filter(notif => 
        notif.userId === userId && !notif.isRead
    ).length;
};
