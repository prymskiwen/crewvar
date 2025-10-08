import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContextFirebase';
import {
    setUserPresence,
    subscribeToRoomPresence,
    joinRoomPresence,
    leaveRoomPresence,
    subscribeToTypingIndicators,
    cleanupPresence,
    PresenceStatus,
    TypingIndicator
} from '../firebase/firestore';

interface RealtimeContextType {
    isConnected: boolean;
    onlineUsers: PresenceStatus[];
    typingUsers: { [roomId: string]: TypingIndicator[] };
    roomParticipants: { [roomId: string]: { [userId: string]: { userName: string; joinedAt: any } } };
    setUserStatus: (status: 'online' | 'away' | 'offline') => Promise<void>;
    joinRoom: (roomId: string) => Promise<void>;
    leaveRoom: (roomId: string) => Promise<void>;
    startTyping: (roomId: string) => Promise<void>;
    stopTyping: (roomId: string) => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (context === undefined) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }
    return context;
};

interface RealtimeProviderProps {
    children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
    const { currentUser, userProfile, loading } = useAuth();

    // All hooks must be called in the same order every time
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<PresenceStatus[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [roomId: string]: TypingIndicator[] }>({});
    const [roomParticipants, setRoomParticipants] = useState<{ [roomId: string]: { [userId: string]: { userName: string; joinedAt: any } } }>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Unsubscribe functions - use ref to avoid dependency issues
    const unsubscribeFunctionsRef = useRef<(() => void)[]>([]);

    useEffect(() => {
        // Only connect to realtime services after auth is fully loaded
        if (currentUser && userProfile && !loading) {
            // Track current user ID
            setCurrentUserId(currentUser.uid);
            
            // Set user online
            setUserPresence(currentUser.uid, userProfile.displayName, 'online')
                .then(() => {
                    setIsConnected(true);
                })
                .catch((error: any) => {
                    console.error('Error setting user online:', error);
                });

            // Subscribe to online users (using room presence for now)
            // Note: This would need to be implemented based on your specific needs
            // For now, we'll skip this subscription

            // Cleanup on unmount
            return () => {
                setUserPresence(currentUser.uid, userProfile.displayName, 'offline').catch(console.error);
            };
        } else if (!currentUser && !loading) {
            // User signed out - cleanup all connections
            console.log('User signed out, cleaning up realtime connections...');
            
            // Set user offline before cleaning up
            if (currentUserId) {
                setUserPresence(currentUserId, 'Unknown User', 'offline')
                    .then(() => {
                        console.log('User presence set to offline');
                    })
                    .catch((error: any) => {
                        console.error('Error setting user offline:', error);
                    });
            }
            
            setIsConnected(false);
            setOnlineUsers([]);
            setTypingUsers({});
            setRoomParticipants({});
            setCurrentUserId(null);

            // Clean up all subscriptions
            unsubscribeFunctionsRef.current.forEach(unsubscribe => {
                try {
                    unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing:', error);
                }
            });
            unsubscribeFunctionsRef.current = [];
        }
    }, [currentUser, userProfile, loading, currentUserId]);

    const setUserStatus = async (status: 'online' | 'away' | 'offline') => {
        if (currentUser && userProfile) {
            try {
                await setUserPresence(currentUser.uid, userProfile.displayName, status);
            } catch (error) {
                console.error('Error updating user status:', error);
                throw error;
            }
        }
    };

    const joinRoom = async (roomId: string) => {
        if (currentUser && userProfile) {
            try {
                await joinRoomPresence(roomId, currentUser.uid, userProfile.displayName);

                // Subscribe to typing indicators for this room
                const unsubscribeTyping = subscribeToTypingIndicators(roomId, (typing: TypingIndicator[]) => {
                    setTypingUsers(prev => ({
                        ...prev,
                        [roomId]: typing
                    }));
                });

                // Subscribe to room participants
                const unsubscribeParticipants = subscribeToRoomPresence(roomId, (participants: PresenceStatus[]) => {
                    // Convert PresenceStatus[] to the expected format
                    const participantsMap = participants.reduce((acc: any, participant: PresenceStatus) => {
                        acc[participant.userId] = {
                            userName: participant.userName,
                            joinedAt: participant.lastSeen
                        };
                        return acc;
                    }, {} as { [userId: string]: { userName: string; joinedAt: any } });

                    setRoomParticipants(prev => ({
                        ...prev,
                        [roomId]: participantsMap
                    }));
                });

                unsubscribeFunctionsRef.current.push(unsubscribeTyping, unsubscribeParticipants);
            } catch (error) {
                console.error('Error joining room:', error);
                throw error;
            }
        }
    };

    const leaveRoom = async (roomId: string) => {
        if (currentUser) {
            try {
                await leaveRoomPresence(roomId, currentUser.uid);

                // Clean up subscriptions for this room
                setTypingUsers(prev => {
                    const newTypingUsers = { ...prev };
                    delete newTypingUsers[roomId];
                    return newTypingUsers;
                });

                setRoomParticipants(prev => {
                    const newRoomParticipants = { ...prev };
                    delete newRoomParticipants[roomId];
                    return newRoomParticipants;
                });
            } catch (error) {
                console.error('Error leaving room:', error);
                throw error;
            }
        }
    };

    const startTyping = async (roomId: string) => {
        if (currentUser && userProfile) {
            try {
                const { startTyping: startTypingFn } = await import('../firebase/firestore');
                startTypingFn(roomId, currentUser.uid, userProfile.displayName);
            } catch (error) {
                console.error('Error starting typing:', error);
                throw error;
            }
        }
    };

    const stopTyping = async (roomId: string) => {
        if (currentUser) {
            try {
                const { stopTyping: stopTypingFn } = await import('../firebase/firestore');
                stopTypingFn(roomId, currentUser.uid);
            } catch (error) {
                console.error('Error stopping typing:', error);
                throw error;
            }
        }
    };

    // Cleanup all subscriptions on unmount
    useEffect(() => {
        return () => {
            unsubscribeFunctionsRef.current.forEach(unsubscribe => {
                try {
                    unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing on unmount:', error);
                }
            });
        };
    }, []);

    const value: RealtimeContextType = {
        isConnected,
        onlineUsers,
        typingUsers,
        roomParticipants,
        setUserStatus,
        joinRoom,
        leaveRoom,
        startTyping,
        stopTyping
    };

    return (
        <RealtimeContext.Provider value={value}>
            {children}
        </RealtimeContext.Provider>
    );
};
