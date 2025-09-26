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
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { IChatRoom } from '../types/chat.d';

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
        return requestRef.id;
    } catch (error) {
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
                await addDoc(collection(db, 'connections'), {
                    user1Id: requestData.requesterId,
                    user2Id: requestData.receiverId,
                    createdAt: serverTimestamp()
                });
            }
        }
    } catch (error) {
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

export const markMessagesAsRead = async (roomId: string, userId: string): Promise<void> => {
    try {
        const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
        const q = query(messagesRef, where('senderId', '!=', userId), where('isRead', '==', false));
        const querySnapshot = await getDocs(q);

        const batch: Promise<void>[] = [];
        querySnapshot.forEach((doc) => {
            batch.push(updateDoc(doc.ref, {
                isRead: true,
                readAt: serverTimestamp()
            }));
        });

        await Promise.all(batch);
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};

// Real-time listeners
export const subscribeToChatMessages = (
    roomId: string,
    callback: (messages: ChatMessage[]) => void
) => {
    const messagesQuery = query(
        collection(db, 'chatMessages'),
        where('roomId', '==', roomId),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ChatMessage));
        callback(messages);
    });
};

export const subscribeToNotifications = (
    userId: string,
    callback: (notifications: Notification[]) => void
) => {
    const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(notificationsQuery, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Notification));
        callback(notifications);
    });
};

// User profile functions
export const getUserProfile = async (userId: string) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
    }
    throw new Error('User profile not found');
};

export const createUserProfile = async (userId: string, profileData: any) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return { id: userId, ...profileData };
};

export const updateUserProfile = async (userId: string, data: any) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};


// Chat room functions
export const getChatRooms = async (userId: string): Promise<IChatRoom[]> => {
    const chatRoomsQuery = query(
        collection(db, 'chatRooms'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(chatRoomsQuery);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            room_id: doc.id,
            other_user_id: data.other_user_id || '',
            other_user_name: data.other_user_name || '',
            other_user_avatar: data.other_user_avatar || '',
            ship_name: data.ship_name || '',
            department_name: data.department_name || '',
            role_name: data.role_name || '',
            last_message_content: data.last_message_content || '',
            last_message_time: data.last_message_time || '',
            last_message_status: data.last_message_status || '',
            unread_count: data.unread_count || 0,
            created_at: data.created_at || '',
            updated_at: data.updated_at || '',
            participants: data.participants || [],
            lastMessage: data.lastMessage,
            lastActivity: data.lastActivity || '',
            unreadCount: data.unreadCount || 0
        } as IChatRoom;
    });
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

// Get roles by department
export const getRolesByDepartment = async (departmentId: string): Promise<Role[]> => {
    try {
        const rolesRef = collection(db, 'roles');
        const q = query(
            rolesRef,
            where('departmentId', '==', departmentId),
            orderBy('name', 'asc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Role));
    } catch (error) {
        console.error('Error fetching roles by department:', error);
        throw error;
    }
};
