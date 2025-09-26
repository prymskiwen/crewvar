// Port connections data utilities

export const getConnectionDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const timeDiff = end.getTime() - start.getTime();
  const days = Math.floor(timeDiff / (1000 * 3600 * 24));
  const hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
};

export const formatPortConnectionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getPortConnectionStatus = (startDate: string, endDate: string): 'active' | 'upcoming' | 'completed' => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'active';
};

export const samplePortConnections = [
  {
    id: '1',
    port_name: 'Miami',
    country: 'USA',
    start_date: '2024-01-20T08:00:00Z',
    end_date: '2024-01-22T18:00:00Z',
    ship_name: 'Carnival Horizon',
    cruise_line: 'Carnival Cruise Line'
  },
  {
    id: '2',
    port_name: 'Cozumel',
    country: 'Mexico',
    start_date: '2024-01-25T07:00:00Z',
    end_date: '2024-01-25T17:00:00Z',
    ship_name: 'Carnival Horizon',
    cruise_line: 'Carnival Cruise Line'
  }
];
