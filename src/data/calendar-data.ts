import { ICruiseAssignment, ICalendarEvent } from "../types/calendar";

// Sample Cruise Assignments Data
export const sampleAssignments: ICruiseAssignment[] = [
    {
        id: "assignment_1",
        userId: "current_user",
        cruiseLineId: "1",
        shipId: "1",
        startDate: "2024-01-15",
        endDate: "2024-01-22",
        status: "completed",
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-10T10:00:00Z"
    },
    {
        id: "assignment_2",
        userId: "current_user",
        cruiseLineId: "1",
        shipId: "2",
        startDate: "2024-02-01",
        endDate: "2024-02-08",
        status: "current",
        createdAt: "2024-01-25T10:00:00Z",
        updatedAt: "2024-01-25T10:00:00Z"
    },
    {
        id: "assignment_3",
        userId: "current_user",
        cruiseLineId: "2",
        shipId: "7",
        startDate: "2024-03-10",
        endDate: "2024-03-17",
        status: "upcoming",
        createdAt: "2024-02-15T10:00:00Z",
        updatedAt: "2024-02-15T10:00:00Z"
    }
];

// Sample Calendar Events Data
export const sampleEvents: ICalendarEvent[] = [
    {
        id: "event_1",
        title: "Port: Miami",
        start: "2024-01-15",
        end: "2024-01-15",
        type: "port",
        description: "Departure from Miami",
        color: "#069B93"
    },
    {
        id: "event_2",
        title: "Port: Nassau",
        start: "2024-01-17",
        end: "2024-01-17",
        type: "port",
        description: "Port call in Nassau",
        color: "#069B93"
    },
    {
        id: "event_3",
        title: "Port: Port Canaveral",
        start: "2024-01-22",
        end: "2024-01-22",
        type: "port",
        description: "Return to Port Canaveral",
        color: "#069B93"
    }
];

// Helper Functions
export const addAssignment = (assignment: Omit<ICruiseAssignment, 'id' | 'createdAt' | 'updatedAt'>): ICruiseAssignment => {
    const newAssignment: ICruiseAssignment = {
        ...assignment,
        id: `assignment_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    sampleAssignments.push(newAssignment);
    return newAssignment;
};

export const updateAssignment = (assignmentId: string, updates: Partial<ICruiseAssignment>): ICruiseAssignment | null => {
    const assignment = sampleAssignments.find(a => a.id === assignmentId);
    if (!assignment) return null;
    
    Object.assign(assignment, updates);
    assignment.updatedAt = new Date().toISOString();
    
    return assignment;
};

export const deleteAssignment = (assignmentId: string): boolean => {
    const index = sampleAssignments.findIndex(a => a.id === assignmentId);
    if (index === -1) return false;
    
    sampleAssignments.splice(index, 1);
    return true;
};

export const getAssignmentsForDateRange = (startDate: string, endDate: string): ICruiseAssignment[] => {
    return sampleAssignments.filter(assignment => {
        const assignmentStart = new Date(assignment.startDate);
        const assignmentEnd = new Date(assignment.endDate);
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(endDate);
        
        return assignmentStart <= rangeEnd && assignmentEnd >= rangeStart;
    });
};

export const getEventsForDateRange = (startDate: string, endDate: string): ICalendarEvent[] => {
    return sampleEvents.filter(event => {
        const eventDate = new Date(event.start);
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(endDate);
        
        return eventDate >= rangeStart && eventDate <= rangeEnd;
    });
};

export const getCurrentAssignment = (): ICruiseAssignment | null => {
    const today = new Date().toISOString().split('T')[0];
    return sampleAssignments.find(assignment => 
        assignment.status === 'current' && 
        assignment.startDate <= today && 
        assignment.endDate >= today
    ) || null;
};

export const getUpcomingAssignments = (limit: number = 5): ICruiseAssignment[] => {
    const today = new Date().toISOString().split('T')[0];
    return sampleAssignments
        .filter(assignment => assignment.status === 'upcoming' && assignment.startDate > today)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, limit);
};

export const getAssignmentStatus = (assignment: ICruiseAssignment): ICruiseAssignment['status'] => {
    const today = new Date().toISOString().split('T')[0];
    
    if (assignment.status === 'cancelled') return 'cancelled';
    if (assignment.startDate > today) return 'upcoming';
    if (assignment.endDate < today) return 'completed';
    return 'current';
};

export const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
    const endFormatted = end.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
};

export const getDaysDifference = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
};
