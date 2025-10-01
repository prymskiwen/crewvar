import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    writeBatch,
    startAfter,
    increment,
    onSnapshot
} from 'firebase/firestore';
import { sendLiveNotification } from './realtime';
import { db } from './config';

// Types
export interface ChatRoom {
    id: string;
    participants: string[];
    lastMessage?: string;
    lastMessageAt?: any;
    unreadCounts: { [userId: string]: number };
    createdAt: any;
    updatedAt: any;
}

export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    messageType: 'text' | 'image' | 'file';
    fileUrl?: string;
    isRead: boolean;
    createdAt: any;
}

export interface Connection {
    id: string;
    user1Id: string;
    user2Id: string;
    createdAt: any;
}

export interface ConnectionRequest {
    id: string;
    requesterId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    message?: string;
    createdAt: any;
    updatedAt: any;
}

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    data?: any;
    createdAt: any;
}

// Chat functions
// getChatRooms function moved to end of file

export const getChatMessages = async (
    roomId: string,
    page: number = 1,
    pageSize: number = 20
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> => {
    try {
        let messagesQuery = query(
            collection(db, 'chatMessages'),
            where('roomId', '==', roomId),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );

        if (page > 1) {
            // For pagination, you'd need to implement cursor-based pagination
            // This is a simplified version
            const offset = (page - 1) * pageSize;
            messagesQuery = query(
                collection(db, 'chatMessages'),
                where('roomId', '==', roomId),
                orderBy('createdAt', 'desc'),
                limit(offset + pageSize)
            );
        }

        const snapshot = await getDocs(messagesQuery);
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ChatMessage));

        return {
            messages: messages.slice(0, pageSize),
            hasMore: messages.length > pageSize
        };
    } catch (error) {
        throw error;
    }
};

export const sendChatMessage = async (
    roomId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    fileUrl?: string
): Promise<string> => {
    try {
        // Add message to chatMessages collection
        const messageData = {
            roomId,
            senderId,
            content,
            messageType,
            fileUrl: fileUrl || null,
            isRead: false,
            createdAt: serverTimestamp()
        };

        const messageRef = await addDoc(collection(db, 'chatMessages'), messageData);

        // Update chat room with last message
        const roomRef = doc(db, 'chatRooms', roomId);
        await updateDoc(roomRef, {
            lastMessage: content,
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return messageRef.id;
    } catch (error) {
        throw error;
    }
};

export const createChatRoom = async (participants: string[]): Promise<string> => {
    try {
        const roomData = {
            participants,
            lastMessage: null,
            lastMessageAt: null,
            unreadCounts: participants.reduce((acc, userId) => {
                acc[userId] = 0;
                return acc;
            }, {} as { [userId: string]: number }),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const roomRef = await addDoc(collection(db, 'chatRooms'), roomData);
        return roomRef.id;
    } catch (error) {
        throw error;
    }
};

// Connection functions
export const getConnections = async (userId: string): Promise<Connection[]> => {
    try {
        const connectionsQuery1 = query(
            collection(db, 'connections'),
            where('user1Id', '==', userId)
        );

        const connectionsQuery2 = query(
            collection(db, 'connections'),
            where('user2Id', '==', userId)
        );

        const [snapshot1, snapshot2] = await Promise.all([
            getDocs(connectionsQuery1),
            getDocs(connectionsQuery2)
        ]);

        const connections = [
            ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection)),
            ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection))
        ];

        return connections;
    } catch (error) {
        throw error;
    }
};

export const sendConnectionRequest = async (
    requesterId: string,
    receiverId: string,
    message?: string
): Promise<string> => {
    try {
        const requestData = {
            requesterId,
            receiverId,
            status: 'pending',
            message: message || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const requestRef = await addDoc(collection(db, 'connectionRequests'), requestData);

        // Create notification for the receiver
        await createNotification({
            userId: receiverId,
            type: 'connection_request',
            title: 'New Connection Request',
            message: message || 'Someone wants to connect with you!',
            data: {
                requesterId,
                requestId: requestRef.id
            },
            isRead: false
        });

        // Send live notification
        try {
            await sendLiveNotification(
                receiverId,
                'connection_request',
                'New Connection Request',
                message || 'Someone wants to connect with you!'
            );
        } catch (error) {
            console.error('Error sending live notification:', error);
        }

        return requestRef.id;
    } catch (error) {
        console.error('Error creating connection request:', error);
        throw error;
    }
};

// Get user's connections
export const getUserConnections = async (userId: string): Promise<any[]> => {
    try {
        const connectionsRef = collection(db, 'connections');
        const q = query(
            connectionsRef,
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching user connections:', error);
        throw error;
    }
};

// Get pending connection requests for a user
export const getPendingConnectionRequests = async (userId: string): Promise<any[]> => {
    try {
        const requestsRef = collection(db, 'connectionRequests');
        const q = query(
            requestsRef,
            where('requesterId', '==', userId),
            where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching pending connection requests:', error);
        throw error;
    }
};

// Create a notification for a user
export const createNotification = async (notificationData: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    isRead?: boolean;
}): Promise<string> => {
    try {
        const notificationRef = await addDoc(collection(db, 'notifications'), {
            userId: notificationData.userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data || {},
            isRead: notificationData.isRead || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return notificationRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

export const respondToConnectionRequest = async (
    requestId: string,
    status: 'accepted' | 'declined'
): Promise<void> => {
    try {
        const requestRef = doc(db, 'connectionRequests', requestId);
        await updateDoc(requestRef, {
            status,
            updatedAt: serverTimestamp()
        });

        if (status === 'accepted') {
            // Get the request to create connection
            const requestDoc = await getDoc(requestRef);
            if (requestDoc.exists()) {
                const requestData = requestDoc.data();
                const { requesterId, receiverId } = requestData;

                // Create connections for both users
                const connectionsRef = collection(db, 'connections');

                // Create connection for requester
                await addDoc(connectionsRef, {
                    userId: requesterId,
                    connectedUserId: receiverId,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                // Create connection for receiver
                await addDoc(connectionsRef, {
                    userId: receiverId,
                    connectedUserId: requesterId,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                // Create notification for the requester
                await createNotification({
                    userId: requesterId,
                    type: 'connection_accepted',
                    title: 'Connection Request Accepted',
                    message: 'Your connection request has been accepted!',
                    data: {
                        receiverId,
                        requestId
                    },
                    isRead: false
                });

                // Automatically create a chat room for the connected users
                try {
                    const chatRoomId = await createOrGetChatRoom(requesterId, receiverId);
                    console.log('Chat room created automatically:', chatRoomId);
                } catch (chatError) {
                    console.error('Error creating chat room:', chatError);
                    // Don't throw error here as connection is already successful
                }
            }
        } else {
            // Create notification for declined request
            const requestDoc = await getDoc(requestRef);
            if (requestDoc.exists()) {
                const { requesterId } = requestDoc.data();

                await createNotification({
                    userId: requesterId,
                    type: 'connection_declined',
                    title: 'Connection Request Declined',
                    message: 'Your connection request was declined.',
                    data: {
                        requestId
                    },
                    isRead: false
                });
            }
        }
    } catch (error) {
        throw error;
    }
};

// Get connection requests received by a user
export const getReceivedConnectionRequests = async (userId: string): Promise<any[]> => {
    try {
        const requestsRef = collection(db, 'connectionRequests');
        const q = query(
            requestsRef,
            where('receiverId', '==', userId),
            where('status', '==', 'pending')
            // Temporarily removed orderBy to avoid index requirement while building
        );
        const snapshot = await getDocs(q);

        // Get basic request data
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];

        // Helper functions to get names
        const getDepartmentName = async (departmentId: string) => {
            try {
                const departmentDoc = await getDoc(doc(db, 'departments', departmentId));
                return departmentDoc.exists() ? departmentDoc.data().name : 'Unknown Department';
            } catch (error) {
                console.error('Error fetching department name:', error);
                return 'Unknown Department';
            }
        };

        const getRoleName = async (roleId: string) => {
            try {
                const roleDoc = await getDoc(doc(db, 'roles', roleId));
                return roleDoc.exists() ? roleDoc.data().name : 'Unknown Role';
            } catch (error) {
                console.error('Error fetching role name:', error);
                return 'Unknown Role';
            }
        };

        // Fetch requester profiles for each request
        const requestsWithProfiles = await Promise.all(
            requests.map(async (request) => {
                try {
                    const requesterProfile = await getUserProfile(request.requesterId) as any;

                    // Get ship and cruise line information
                    let shipName = 'Not specified';
                    let cruiseLineName = 'Not specified';

                    if (requesterProfile.currentShipId) {
                        try {
                            const shipDoc = await getDoc(doc(db, 'ships', requesterProfile.currentShipId));
                            if (shipDoc.exists()) {
                                const shipData = shipDoc.data();
                                shipName = shipData.name;

                                // Get cruise line from ship
                                if (shipData.cruiseLineId) {
                                    const cruiseLineDoc = await getDoc(doc(db, 'cruiseLines', shipData.cruiseLineId));
                                    if (cruiseLineDoc.exists()) {
                                        cruiseLineName = cruiseLineDoc.data().name;
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching ship/cruise line data:', error);
                        }
                    }

                    return {
                        ...request,
                        requesterName: requesterProfile.displayName,
                        requesterPhoto: requesterProfile.profilePhoto,
                        shipName,
                        cruiseLineName,
                        departmentName: requesterProfile.departmentId ? await getDepartmentName(requesterProfile.departmentId) : 'Not specified',
                        roleName: requesterProfile.roleId ? await getRoleName(requesterProfile.roleId) : 'Not specified'
                    };
                } catch (error) {
                    console.error(`Error fetching profile for ${request.requesterId}:`, error);
                    return {
                        ...request,
                        requesterName: 'Unknown User',
                        requesterPhoto: null,
                        shipName: 'Not specified',
                        cruiseLineName: 'Not specified',
                        departmentName: 'Not specified',
                        roleName: 'Not specified'
                    };
                }
            })
        );

        // Sort by createdAt descending in memory
        return requestsWithProfiles.sort((a, b) => {
            const aTime = (a as any).createdAt?.seconds || 0;
            const bTime = (b as any).createdAt?.seconds || 0;
            return bTime - aTime;
        });
    } catch (error) {
        console.error('Error fetching received connection requests:', error);
        throw error;
    }
};

// Notification functions
export const getNotifications = async (userId: string): Promise<Notification[]> => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(notificationsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Notification));
    } catch (error) {
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            isRead: true,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        throw error;
    }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await deleteDoc(notificationRef);
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

// User Profile Functions

// Get user profile by ID
export const getUserProfile = async (userId: string) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return { id: userDoc.id, ...userData };
        }
        throw new Error('User profile not found');
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Create user profile (id is the auth uid)
export const createUserProfile = async (userId: string, profileData: any) => {
    try {
        const userRef = doc(db, 'users', userId);

        // Remove undefined/null/empty string values to avoid Firestore errors
        const cleanData = Object.fromEntries(
            Object.entries(profileData || {}).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );

        const dataToWrite = {
            ...cleanData,
            isActive: cleanData.isActive ?? true,
            isAdmin: cleanData.isAdmin ?? false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(userRef, dataToWrite);
        return { id: userId, ...dataToWrite };
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
};

// Update user profile (partial updates)
export const updateUserProfile = async (userId: string, updates: any) => {
    try {
        const userRef = doc(db, 'users', userId);

        const cleanUpdates = Object.fromEntries(
            Object.entries(updates || {}).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );

        await updateDoc(userRef, {
            ...cleanUpdates,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

// Subscribe to notifications for a user (real-time listener)
export const subscribeToNotifications = (
    userId: string,
    callback: (notifications: any[]) => void
) => {
    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(items);
    });
};

// Chat and Messaging Functions

// Create or get existing chat room between two users
export const createOrGetChatRoom = async (userId1: string, userId2: string): Promise<string> => {
    try {
        // Check if chat room already exists
        const chatRoomsRef = collection(db, 'chatRooms');
        const q = query(
            chatRoomsRef,
            where('participants', 'array-contains', userId1)
        );

        const snapshot = await getDocs(q);
        const existingRoom = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.participants.includes(userId2);
        });

        if (existingRoom) {
            return existingRoom.id;
        }

        // Create new chat room
        const newRoomData = {
            participants: [userId1, userId2],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: null,
            lastMessageAt: null,
            unreadCount: {
                [userId1]: 0,
                [userId2]: 0
            }
        };

        const roomRef = await addDoc(collection(db, 'chatRooms'), newRoomData);
        return roomRef.id;
    } catch (error) {
        console.error('Error creating/getting chat room:', error);
        throw error;
    }
};

// Get chat rooms for a user
export const getChatRooms = async (userId: string): Promise<any[]> => {
    try {
        const chatRoomsRef = collection(db, 'chatRooms');
        const q = query(
            chatRoomsRef,
            where('participants', 'array-contains', userId),
            orderBy('updatedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const rooms = [];

        for (const doc of snapshot.docs) {
            const roomData = doc.data();
            const otherUserId = roomData.participants.find((id: string) => id !== userId);

            if (otherUserId) {
                try {
                    const otherUserProfile = await getUserProfile(otherUserId) as any;
                    console.log('getChatRooms - otherUserProfile:', {
                        otherUserId,
                        otherUserProfile,
                        currentShipId: otherUserProfile?.currentShipId,
                        departmentId: otherUserProfile?.departmentId,
                        roleId: otherUserProfile?.roleId
                    });
                    rooms.push({
                        id: doc.id,
                        ...roomData,
                        otherUserId,
                        otherUserProfile: {
                            displayName: otherUserProfile.displayName,
                            profilePhoto: otherUserProfile.profilePhoto,
                            currentShipId: otherUserProfile.currentShipId,
                            departmentId: otherUserProfile.departmentId,
                            roleId: otherUserProfile.roleId
                        }
                    });
                } catch (error) {
                    console.error(`Error fetching profile for user ${otherUserId}:`, error);
                    // Add room with minimal data if profile fetch fails
                    rooms.push({
                        id: doc.id,
                        ...roomData,
                        otherUserId,
                        otherUserProfile: {
                            displayName: 'Unknown User',
                            profilePhoto: null,
                            currentShipId: null,
                            departmentId: null,
                            roleId: null
                        }
                    });
                }
            }
        }

        return rooms;
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        throw error;
    }
};

// Send a message
export const sendMessage = async (
    roomId: string,
    senderId: string,
    message: string,
    messageType: 'text' | 'image' | 'file' = 'text'
): Promise<string> => {
    try {
        const messagesRef = collection(db, 'chatMessages');
        const messageData = {
            roomId,
            senderId,
            message,
            messageType,
            createdAt: serverTimestamp(),
            isRead: false
        };

        const messageRef = await addDoc(messagesRef, messageData);

        // Update chat room with last message info
        const roomRef = doc(db, 'chatRooms', roomId);
        await updateDoc(roomRef, {
            lastMessage: message,
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Increment unread count for other participants
        const roomDoc = await getDoc(roomRef);
        if (roomDoc.exists()) {
            const roomData = roomDoc.data();
            const otherParticipants = roomData.participants.filter((id: string) => id !== senderId);

            const unreadUpdates: any = {};
            otherParticipants.forEach((participantId: string) => {
                unreadUpdates[`unreadCount.${participantId}`] = increment(1);
            });

            if (Object.keys(unreadUpdates).length > 0) {
                await updateDoc(roomRef, unreadUpdates);
            }
        }

        return messageRef.id;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Get messages for a chat room
export const getMessages = async (roomId: string, messageLimit: number = 50): Promise<any[]> => {
    try {
        const messagesRef = collection(db, 'chatMessages');
        const q = query(
            messagesRef,
            where('roomId', '==', roomId),
            orderBy('createdAt', 'desc'),
            limit(messageLimit)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).reverse(); // Reverse to show oldest first
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

// Mark messages as read
export const markMessagesAsRead = async (roomId: string, userId: string): Promise<void> => {
    try {
        // Get all messages in the room and filter in memory to avoid index issues
        const messagesRef = collection(db, 'chatMessages');
        const q = query(
            messagesRef,
            where('roomId', '==', roomId)
        );

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        let hasUpdates = false;

        // Filter messages that need to be marked as read
        snapshot.docs.forEach(doc => {
            const messageData = doc.data();
            if (messageData.senderId !== userId && messageData.isRead === false) {
                batch.update(doc.ref, { isRead: true });
                hasUpdates = true;
            }
        });

        // Only commit if there are updates
        if (hasUpdates) {
            await batch.commit();
        }

        // Reset unread count for the user
        const roomRef = doc(db, 'chatRooms', roomId);
        await updateDoc(roomRef, {
            [`unreadCount.${userId}`]: 0
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};

// Get unread message count for a user
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
    try {
        const chatRoomsRef = collection(db, 'chatRooms');
        const q = query(
            chatRoomsRef,
            where('participants', 'array-contains', userId)
        );

        const snapshot = await getDocs(q);
        let totalUnread = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            totalUnread += data.unreadCount?.[userId] || 0;
        });

        return totalUnread;
    } catch (error) {
        console.error('Error getting unread message count:', error);
        return 0;
    }
};


export const getNotificationsForUser = async (
    userId: string,
    limitCount: number = 50,
    startAfterDoc?: any
): Promise<Notification[]> => {
    try {
        let notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        // Add pagination if startAfterDoc is provided
        if (startAfterDoc) {
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                startAfter(startAfterDoc),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(notificationsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Notification));
    } catch (error) {
        console.error('Error fetching notifications for user:', error);
        throw error;
    }
};

export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('isRead', '==', false)
        );

        const snapshot = await getDocs(notificationsQuery);
        return snapshot.size;
    } catch (error) {
        console.error('Error fetching unread notifications count:', error);
        throw error;
    }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('isRead', '==', false)
        );

        const snapshot = await getDocs(notificationsQuery);

        if (snapshot.empty) {
            return; // No unread notifications
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
                isRead: true,
                updatedAt: serverTimestamp()
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};


// Department and Role Management
export interface Department {
    id: string;
    name: string;
    description?: string;
    createdAt: any;
    updatedAt: any;
}

export interface Role {
    id: string;
    name: string;
    departmentId: string;
    subcategoryId?: string;
    description?: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

export interface User {
    id: string;
    email: string;
    display_name: string;
    bio?: string;
    is_email_verified: boolean;
    verification_token?: string;
    verification_token_expires?: string;
    password_reset_token?: string;
    password_reset_expires?: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
    profile_photo?: string;
    department_id?: string;
    subcategory_id?: string;
    role_id?: string;
    current_ship_id?: string;
    phone?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
    website?: string;
    additional_photo_1?: string;
    additional_photo_2?: string;
    additional_photo_3?: string;
    is_banned: boolean;
    ban_expires_at?: string;
    ban_reason?: string;
    last_login?: string;
}

export interface CruiseLine {
    id: string;
    name: string;
    companyCode?: string;
    headquarters?: string;
    foundedYear?: number;
    fleetSize?: number;
    website?: string;
    logoUrl?: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

export interface Ship {
    id: string;
    name: string;
    cruiseLineId: string;
    shipCode?: string;
    lengthMeters?: number;
    widthMeters?: number;
    grossTonnage?: number;
    yearBuilt?: number;
    refurbishedYear?: number;
    homePort?: string;
    shipType?: string;
    company?: string;
    capacity?: number;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

// Get all departments
export const getDepartments = async (): Promise<Department[]> => {
    try {
        const departmentsRef = collection(db, 'departments');
        const q = query(departmentsRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Department));
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }
};

// Add new department
export const addDepartment = async (departmentData: { name: string; description?: string }): Promise<string> => {
    try {
        const departmentsRef = collection(db, 'departments');
        const docRef = await addDoc(departmentsRef, {
            name: departmentData.name.trim(),
            description: departmentData.description?.trim() || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding department:', error);
        throw error;
    }
};

// Delete department
export const deleteDepartment = async (departmentId: string): Promise<void> => {
    try {
        const departmentRef = doc(db, 'departments', departmentId);
        await deleteDoc(departmentRef);
    } catch (error) {
        console.error('Error deleting department:', error);
        throw error;
    }
};

// Get all cruise lines
export const getCruiseLines = async (): Promise<CruiseLine[]> => {
    try {
        const cruiseLinesRef = collection(db, 'cruiseLines');
        const q = query(cruiseLinesRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as CruiseLine));
    } catch (error) {
        console.error('Error fetching cruise lines:', error);
        throw error;
    }
};

// Add new cruise line
export const addCruiseLine = async (cruiseLineData: {
    name: string;
    companyCode?: string;
    headquarters?: string;
    foundedYear?: number;
    fleetSize?: number;
    website?: string;
    logoUrl?: string;
}): Promise<string> => {
    try {
        const cruiseLinesRef = collection(db, 'cruiseLines');
        const docRef = await addDoc(cruiseLinesRef, {
            name: cruiseLineData.name.trim(),
            companyCode: cruiseLineData.companyCode?.trim() || '',
            headquarters: cruiseLineData.headquarters?.trim() || '',
            foundedYear: cruiseLineData.foundedYear || null,
            fleetSize: cruiseLineData.fleetSize || null,
            website: cruiseLineData.website?.trim() || '',
            logoUrl: cruiseLineData.logoUrl?.trim() || '',
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding cruise line:', error);
        throw error;
    }
};

// Delete cruise line
export const deleteCruiseLine = async (cruiseLineId: string): Promise<void> => {
    try {
        const cruiseLineRef = doc(db, 'cruiseLines', cruiseLineId);
        await deleteDoc(cruiseLineRef);
    } catch (error) {
        console.error('Error deleting cruise line:', error);
        throw error;
    }
};

// Get all ships
export const getShips = async (): Promise<Ship[]> => {
    try {
        const shipsRef = collection(db, 'ships');
        const q = query(shipsRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Ship));
    } catch (error) {
        console.error('Error fetching ships:', error);
        throw error;
    }
};

// Add new ship
export const addShip = async (shipData: {
    name: string;
    cruiseLineId: string;
    shipCode?: string;
    lengthMeters?: number;
    widthMeters?: number;
    grossTonnage?: number;
    yearBuilt?: number;
    refurbishedYear?: number;
    homePort?: string;
    shipType?: string;
    company?: string;
    capacity?: number;
}): Promise<string> => {
    try {
        const shipsRef = collection(db, 'ships');
        const docRef = await addDoc(shipsRef, {
            name: shipData.name.trim(),
            cruiseLineId: shipData.cruiseLineId,
            shipCode: shipData.shipCode?.trim() || '',
            lengthMeters: shipData.lengthMeters || null,
            widthMeters: shipData.widthMeters || null,
            grossTonnage: shipData.grossTonnage || null,
            yearBuilt: shipData.yearBuilt || null,
            refurbishedYear: shipData.refurbishedYear || null,
            homePort: shipData.homePort?.trim() || '',
            shipType: shipData.shipType?.trim() || '',
            company: shipData.company?.trim() || '',
            capacity: shipData.capacity || null,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding ship:', error);
        throw error;
    }
};

// Delete ship
export const deleteShip = async (shipId: string): Promise<void> => {
    try {
        const shipRef = doc(db, 'ships', shipId);
        await deleteDoc(shipRef);
    } catch (error) {
        console.error('Error deleting ship:', error);
        throw error;
    }
};

// Add new role
export const addRole = async (roleData: { name: string; departmentId: string; subcategoryId?: string; description?: string }): Promise<string> => {
    try {
        const rolesRef = collection(db, 'roles');
        const docRef = await addDoc(rolesRef, {
            name: roleData.name.trim(),
            departmentId: roleData.departmentId,
            subcategoryId: roleData.subcategoryId || null,
            description: roleData.description?.trim() || '',
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding role:', error);
        throw error;
    }
};

// Delete role
export const deleteRole = async (roleId: string): Promise<void> => {
    try {
        const roleRef = doc(db, 'roles', roleId);
        await deleteDoc(roleRef);
    } catch (error) {
        console.error('Error deleting role:', error);
        throw error;
    }
};

// User Management Functions

// Get all users
export const getUsers = async (limitCount: number = 50): Promise<User[]> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
        const querySnapshot = await getDocs(q);

        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                id: doc.id,
                email: data.email || '',
                display_name: data.displayName || data.display_name || '',
                bio: data.bio || undefined,
                is_email_verified: data.emailVerified || data.is_email_verified || false,
                verification_token: data.verificationToken || data.verification_token || undefined,
                verification_token_expires: data.verificationTokenExpires?.toDate?.()?.toISOString() || data.verification_token_expires || undefined,
                password_reset_token: data.passwordResetToken || data.password_reset_token || undefined,
                password_reset_expires: data.passwordResetExpires?.toDate?.()?.toISOString() || data.password_reset_expires || undefined,
                is_active: data.isActive !== false, // Default to true if not set
                is_admin: data.isAdmin || data.is_admin || false,
                created_at: data.createdAt?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString(),
                updated_at: data.updatedAt?.toDate?.()?.toISOString() || data.updated_at || new Date().toISOString(),
                profile_photo: data.profilePhoto || data.profile_photo || undefined,
                department_id: data.departmentId || data.department_id || undefined,
                subcategory_id: data.subcategoryId || data.subcategory_id || undefined,
                role_id: data.roleId || data.role_id || undefined,
                current_ship_id: data.currentShipId || data.current_ship_id || undefined,
                phone: data.phone || undefined,
                instagram: data.instagram || undefined,
                twitter: data.twitter || undefined,
                facebook: data.facebook || undefined,
                snapchat: data.snapchat || undefined,
                website: data.website || undefined,
                additional_photo_1: data.additionalPhoto1 || data.additional_photo_1 || undefined,
                additional_photo_2: data.additionalPhoto2 || data.additional_photo_2 || undefined,
                additional_photo_3: data.additionalPhoto3 || data.additional_photo_3 || undefined,
                is_banned: data.isBanned || data.is_banned || false,
                ban_expires_at: data.banExpiresAt?.toDate?.()?.toISOString() || data.ban_expires_at || undefined,
                ban_reason: data.banReason || data.ban_reason || undefined,
                last_login: data.lastLoginAt?.toDate?.()?.toISOString() || data.last_login || undefined
            });
        });

        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Ban user
export const banUser = async (userId: string, reason: string, expiresAt?: Date): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        const updateData: any = {
            isBanned: true,
            banReason: reason,
            updatedAt: serverTimestamp()
        };

        if (expiresAt) {
            updateData.banExpiresAt = expiresAt;
        }

        await updateDoc(userRef, updateData);
    } catch (error) {
        console.error('Error banning user:', error);
        throw error;
    }
};

// Unban user
export const unbanUser = async (userId: string): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isBanned: false,
            banReason: null,
            banExpiresAt: null,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error unbanning user:', error);
        throw error;
    }
};

// Update user status
export const updateUserStatus = async (userId: string, updates: {
    isActive?: boolean;
    isAdmin?: boolean;
    isEmailVerified?: boolean;
    departmentId?: string;
    subcategoryId?: string;
    roleId?: string;
    currentShipId?: string;
    phone?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
    website?: string;
}): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        const updateData: any = {
            updatedAt: serverTimestamp()
        };

        if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
        if (updates.isAdmin !== undefined) updateData.isAdmin = updates.isAdmin;
        if (updates.isEmailVerified !== undefined) updateData.emailVerified = updates.isEmailVerified;
        if (updates.departmentId !== undefined) updateData.departmentId = updates.departmentId;
        if (updates.subcategoryId !== undefined) updateData.subcategoryId = updates.subcategoryId;
        if (updates.roleId !== undefined) updateData.roleId = updates.roleId;
        if (updates.currentShipId !== undefined) updateData.currentShipId = updates.currentShipId;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        if (updates.instagram !== undefined) updateData.instagram = updates.instagram;
        if (updates.twitter !== undefined) updateData.twitter = updates.twitter;
        if (updates.facebook !== undefined) updateData.facebook = updates.facebook;
        if (updates.snapchat !== undefined) updateData.snapchat = updates.snapchat;
        if (updates.website !== undefined) updateData.website = updates.website;

        await updateDoc(userRef, updateData);
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

// Update user's current ship assignment
export const updateUserShipAssignment = async (userId: string, shipId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            currentShipId: shipId,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating ship assignment:', error);
        throw error;
    }
};

// Privacy settings functions
export const getPrivacySettings = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
                userId: userData.id,
                isVerified: userData.isEmailVerified || false,
                isActive: userData.isActive !== false,
                showOnlyTodayShip: userData.showOnlyTodayShip || false,
                allowFutureShipVisibility: userData.allowFutureShipVisibility !== false,
                declineRequestsSilently: userData.declineRequestsSilently || false,
                blockEnforcesInvisibility: userData.blockEnforcesInvisibility !== false,
                lastActiveDate: userData.lastActiveDate || new Date().toISOString().split('T')[0],
                verificationStatus: userData.isEmailVerified ? 'verified' as const : 'pending' as const
            };
        }

        // Return default settings if user doesn't exist
        return {
            userId,
            isVerified: false,
            isActive: true,
            showOnlyTodayShip: false,
            allowFutureShipVisibility: true,
            declineRequestsSilently: false,
            blockEnforcesInvisibility: false,
            lastActiveDate: new Date().toISOString().split('T')[0],
            verificationStatus: 'pending' as const
        };
    } catch (error) {
        console.error('Error fetching privacy settings:', error);
        throw error;
    }
};

export const updatePrivacySettings = async (userId: string, settings: any) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            showOnlyTodayShip: settings.showOnlyTodayShip,
            allowFutureShipVisibility: settings.allowFutureShipVisibility,
            declineRequestsSilently: settings.declineRequestsSilently,
            blockEnforcesInvisibility: settings.blockEnforcesInvisibility,
            lastActiveDate: settings.lastActiveDate,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        throw error;
    }
};

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
    try {
        const rolesRef = collection(db, 'roles');
        const q = query(rolesRef);
        const querySnapshot = await getDocs(q);

        const roles = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Role));

        return roles.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

// Get roles by department
export const getRolesByDepartment = async (departmentId: string): Promise<Role[]> => {
    try {
        const rolesRef = collection(db, 'roles');
        const q = query(
            rolesRef,
            where('departmentId', '==', departmentId)
        );
        const querySnapshot = await getDocs(q);

        // Sort in memory to avoid index requirement
        const roles = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Role));

        return roles.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error fetching roles by department:', error);
        throw error;
    }
};

// Admin Statistics Functions

export interface AdminStats {
    users: {
        total: number;
        active: number;
        banned: number;
        unverified: number;
    };
    messages: {
        total: number;
        today: number;
    };
    connections: {
        total: number;
        pending: number;
    };
    reports: {
        total: number;
        pending: number;
    };
}

// Get admin statistics
export const getAdminStats = async (): Promise<AdminStats> => {
    try {
        // Initialize default values
        let totalUsers = 0;
        let activeUsers = 0;
        let bannedUsers = 0;
        let unverifiedUsers = 0;
        let totalMessages = 0;
        let todayMessages = 0;
        let totalConnections = 0;
        let pendingConnections = 0;
        let totalReports = 0;
        let pendingReports = 0;

        // Get all users for user statistics
        try {
            const usersRef = collection(db, 'users');
            const usersSnapshot = await getDocs(usersRef);

            usersSnapshot.forEach((doc) => {
                const data = doc.data();
                totalUsers++;

                if (data.isBanned || data.is_banned) {
                    bannedUsers++;
                } else if (data.isActive !== false) {
                    activeUsers++;
                }

                if (!data.emailVerified && !data.is_email_verified) {
                    unverifiedUsers++;
                }
            });
        } catch (error) {
            console.warn('Error fetching users for stats:', error);
        }

        // Get messages statistics
        try {
            const messagesRef = collection(db, 'chatMessages');
            const messagesSnapshot = await getDocs(messagesRef);
            totalMessages = messagesSnapshot.size;

            // Calculate today's messages
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            todayMessages = Array.from(messagesSnapshot.docs).filter(doc => {
                const messageData = doc.data();
                const messageDate = messageData.createdAt?.toDate?.() || new Date(messageData.created_at);
                return messageDate >= today;
            }).length;
        } catch (error) {
            console.warn('Error fetching messages for stats:', error);
        }

        // Get connections statistics
        try {
            const connectionsRef = collection(db, 'connections');
            const connectionsSnapshot = await getDocs(connectionsRef);
            totalConnections = connectionsSnapshot.size;
        } catch (error) {
            console.warn('Error fetching connections for stats:', error);
        }

        // Get connection requests for pending connections
        try {
            const connectionRequestsRef = collection(db, 'connectionRequests');
            const connectionRequestsSnapshot = await getDocs(connectionRequestsRef);
            pendingConnections = connectionRequestsSnapshot.size;
        } catch (error) {
            console.warn('Error fetching connection requests for stats:', error);
        }

        // Get reports statistics
        try {
            const reportsRef = collection(db, 'reports');
            const reportsSnapshot = await getDocs(reportsRef);
            totalReports = reportsSnapshot.size;

            // Calculate pending reports (assuming reports have a status field)
            pendingReports = Array.from(reportsSnapshot.docs).filter(doc => {
                const reportData = doc.data();
                return reportData.status !== 'resolved' && reportData.status !== 'closed';
            }).length;
        } catch (error) {
            console.warn('Error fetching reports for stats:', error);
        }

        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                banned: bannedUsers,
                unverified: unverifiedUsers
            },
            messages: {
                total: totalMessages,
                today: todayMessages
            },
            connections: {
                total: totalConnections,
                pending: pendingConnections
            },
            reports: {
                total: totalReports,
                pending: pendingReports
            }
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
    }
};

// Support Statistics Functions

export interface SupportStats {
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    totalTickets: number;
    resolvedToday: number;
}

// Get support statistics
export const getSupportStats = async (): Promise<SupportStats> => {
    try {
        // Get support tickets from a support collection
        // For now, we'll use a placeholder implementation
        // In a real app, you'd have a support/tickets collection

        // This is a placeholder - you would implement based on your support system
        return {
            openTickets: 0,
            inProgressTickets: 0,
            resolvedTickets: 0,
            closedTickets: 0,
            totalTickets: 0,
            resolvedToday: 0
        };
    } catch (error) {
        console.error('Error fetching support stats:', error);
        throw error;
    }
};

// Get crew members with pagination and filtering
export const getCrewMembers = async (params: {
    cruiseLineId?: string;
    shipId?: string;
    page?: number;
    limit?: number;
    currentUserId?: string;
} = {}): Promise<{
    crew: any[];
    hasNextPage: boolean;
    nextPage?: number;
    total: number;
}> => {
    try {
        const { cruiseLineId, shipId, page = 0, limit: pageLimit = 20 } = params;

        console.log('getCrewMembers called with params:', params);

        let constraints: any[] = [];

        // For now, let's fetch all users and filter client-side to avoid index requirements
        // This is simpler and works without needing composite indexes
        constraints.push(orderBy('displayName'));

        // Note: Admin filtering is done client-side to avoid index requirements
        // TODO: Re-enable database-level filtering once index is built
        // constraints.push(where('isAdmin', '==', false));

        constraints.push(limit(pageLimit + 1)); // Get one extra to check if there are more pages

        console.log('Query constraints:', constraints);

        const q = query(collection(db, 'users'), ...constraints);
        const snapshot = await getDocs(q);
        const docs = snapshot.docs;

        console.log('Query returned', docs.length, 'documents');

        const hasNextPage = docs.length > pageLimit;
        let crew = docs.slice(0, pageLimit).map(doc => {
            const data = doc.data();
            console.log('Crew member data:', { id: doc.id, displayName: data.displayName, currentShipId: data.currentShipId });
            return {
                id: doc.id,
                ...data
            };
        });

        // Apply client-side filtering for ship
        if (shipId) {
            crew = crew.filter(member => (member as any).currentShipId === shipId);
        }

        crew = crew.filter(member => !(member as any).isAdmin);

        // Exclude current user from crew members list
        if (params.currentUserId) {
            const beforeSelfFilter = crew.length;
            crew = crew.filter(member => member.id !== params.currentUserId);
            const afterSelfFilter = crew.length;
            console.log(`Self filtering: ${beforeSelfFilter} -> ${afterSelfFilter} (excluded ${beforeSelfFilter - afterSelfFilter} self)`);
        }
        // If cruiseLineId filter is provided, filter the results client-side
        let filteredCrew = crew;
        if (cruiseLineId) {
            // We'll need to get the ship data to filter by cruise line
            // For now, return all crew and let the client handle the filtering
            console.log('Cruise line filtering will be handled client-side');
        }

        return {
            crew: filteredCrew,
            hasNextPage,
            nextPage: hasNextPage ? page + 1 : undefined,
            total: docs.length
        };
    } catch (error) {
        console.error('Error fetching crew members:', error);
        throw error;
    }
};
