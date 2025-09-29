import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContextFirebase';
import {
    setUserOnline,
    setUserOffline,
    updateUserStatus,
    subscribeToOnlineUsers,
    OnlineUser,
    subscribeToTyping,
    subscribeToRoomParticipants,
    TypingUser
} from '../firebase/realtime';

interface RealtimeContextType {
    isConnected: boolean;
    onlineUsers: OnlineUser[];
    typingUsers: { [roomId: string]: TypingUser[] };
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
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [roomId: string]: TypingUser[] }>({});
    const [roomParticipants, setRoomParticipants] = useState<{ [roomId: string]: { [userId: string]: { userName: string; joinedAt: any } } }>({});

    // Unsubscribe functions - use ref to avoid dependency issues
    const unsubscribeFunctionsRef = useRef<(() => void)[]>([]);

    useEffect(() => {
        // Only connect to realtime services after auth is fully loaded
        if (currentUser && userProfile && !loading) {
            // Set user online
            setUserOnline(currentUser.uid, userProfile.displayName)
                .then(() => {
                    setIsConnected(true);
                })
                .catch((error) => {
                    console.error('Error setting user online:', error);
                });

            // Subscribe to online users
            const unsubscribeOnlineUsers = subscribeToOnlineUsers((users) => {
                setOnlineUsers(users);
            });

            unsubscribeFunctionsRef.current.push(unsubscribeOnlineUsers);

            // Cleanup on unmount
            return () => {
                setUserOffline(currentUser.uid).catch(console.error);
                unsubscribeOnlineUsers();
            };
        } else if (!currentUser && !loading) {
            // User signed out - cleanup all connections
            console.log('User signed out, cleaning up realtime connections...');
            setIsConnected(false);
            setOnlineUsers([]);
            setTypingUsers({});
            setRoomParticipants({});

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
    }, [currentUser, userProfile, loading]);

    const setUserStatus = async (status: 'online' | 'away' | 'offline') => {
        if (currentUser) {
            try {
                await updateUserStatus(currentUser.uid, status);
            } catch (error) {
                console.error('Error updating user status:', error);
                throw error;
            }
        }
    };

    const joinRoom = async (roomId: string) => {
        if (currentUser && userProfile) {
            try {
                const { joinChatRoom } = await import('../firebase/realtime');
                await joinChatRoom(roomId, currentUser.uid, userProfile.displayName);

                // Subscribe to typing indicators for this room
                const unsubscribeTyping = subscribeToTyping(roomId, (typing) => {
                    setTypingUsers(prev => ({
                        ...prev,
                        [roomId]: typing
                    }));
                });

                // Subscribe to room participants
                const unsubscribeParticipants = subscribeToRoomParticipants(roomId, (participants) => {
                    setRoomParticipants(prev => ({
                        ...prev,
                        [roomId]: participants
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
                const { leaveChatRoom } = await import('../firebase/realtime');
                await leaveChatRoom(roomId, currentUser.uid);

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
                const { startTyping: startTypingFn } = await import('../firebase/realtime');
                await startTypingFn(roomId, currentUser.uid, userProfile.displayName);
            } catch (error) {
                console.error('Error starting typing:', error);
                throw error;
            }
        }
    };

    const stopTyping = async (roomId: string) => {
        if (currentUser) {
            try {
                const { stopTyping: stopTypingFn } = await import('../firebase/realtime');
                await stopTypingFn(roomId, currentUser.uid);
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
