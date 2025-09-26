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
