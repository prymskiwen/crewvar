// Sample connection data for development and testing

export const sampleConnectionContext = {
  connections: [
    {
      id: '1',
      user1_id: 'current-user-id',
      user2_id: 'user-2',
      status: 'connected',
      created_at: '2024-01-15T10:30:00Z',
      display_name: 'John Smith',
      profile_photo: '/default-avatar.webp'
    },
    {
      id: '2',
      user1_id: 'current-user-id',
      user2_id: 'user-3',
      status: 'pending',
      created_at: '2024-01-16T14:20:00Z',
      display_name: 'Sarah Johnson',
      profile_photo: '/default-avatar.webp'
    }
  ],
  pendingRequests: [
    {
      id: 'req-1',
      from_user_id: 'user-4',
      to_user_id: 'current-user-id',
      status: 'pending',
      message: 'Hi! I saw you on the same ship. Would love to connect!',
      created_at: '2024-01-17T09:15:00Z',
      display_name: 'Mike Wilson',
      profile_photo: '/default-avatar.webp'
    }
  ],
  mutualFriends: 3,
  pastCoincidences: [
    {
      id: '1',
      ship_name: 'Royal Caribbean Harmony',
      date: '2024-01-10',
      duration: '7 days'
    },
    {
      id: '2',
      ship_name: 'Carnival Vista',
      date: '2023-12-15',
      duration: '5 days'
    }
  ]
};

export const getConnectionStatus = (userId: string, connections: any[]): string => {
  const connection = connections.find(conn =>
    conn.user1_id === userId || conn.user2_id === userId
  );

  return connection?.status || 'not_connected';
};

export const formatConnectionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Additional sample data and functions for ConnectionRequests component
export const sampleProfiles = [
  {
    id: 'user-1',
    displayName: 'John Smith',
    avatar: '/default-avatar.webp',
    department: 'Food & Beverage',
    role: 'Waiter'
  },
  {
    id: 'user-2',
    displayName: 'Sarah Johnson',
    avatar: '/default-avatar.webp',
    department: 'Entertainment',
    role: 'Singer'
  },
  {
    id: 'user-3',
    displayName: 'Mike Wilson',
    avatar: '/default-avatar.webp',
    department: 'Housekeeping',
    role: 'Steward'
  }
];

export const sampleConnections = [
  {
    id: 'conn-1',
    user1_id: 'current-user-id',
    user2_id: 'user-1',
    status: 'connected',
    created_at: '2024-01-15T10:30:00Z'
  }
];

export const sampleConnectionRequests: Array<{
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message: string;
  createdAt: string;
  updatedAt: string;
}> = [
    {
      id: 'req-1',
      fromUserId: 'user-2',
      toUserId: 'current-user-id',
      status: 'pending',
      message: 'Hi! I saw you on the same ship. Would love to connect!',
      createdAt: '2024-01-17T09:15:00Z',
      updatedAt: '2024-01-17T09:15:00Z'
    }
  ];

// Placeholder functions for ConnectionRequests component
export const getPendingRequestsForUser = (userId: string) => {
  return sampleConnectionRequests.filter(req => req.toUserId === userId && req.status === 'pending');
};

export const getSentRequestsForUser = (userId: string) => {
  return sampleConnectionRequests.filter(req => req.fromUserId === userId);
};

export const getNotificationsForUser = (userId: string) => {
  return []; // TODO: Implement notifications
};

export const getUnreadNotificationsCount = (userId: string) => {
  return 0; // TODO: Implement unread count
};
