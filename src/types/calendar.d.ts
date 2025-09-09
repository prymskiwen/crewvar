// Calendar and Schedule Types for Crewvar

export interface ICruiseAssignment {
    id: string;
    userId: string;
    cruiseLineId: string;
    shipId: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    status: 'upcoming' | 'current' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface ICalendarEvent {
    id: string;
    title: string;
    start: string; // ISO date string
    end: string; // ISO date string
    type: 'assignment' | 'port' | 'personal';
    assignmentId?: string;
    description?: string;
    color?: string;
}

export interface ICalendarView {
    view: 'month' | 'week' | 'day';
    currentDate: string; // ISO date string
}

export interface ICalendarContext {
    assignments: ICruiseAssignment[];
    events: ICalendarEvent[];
    currentView: ICalendarView;
    addAssignment: (assignment: Omit<ICruiseAssignment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateAssignment: (assignmentId: string, updates: Partial<ICruiseAssignment>) => Promise<void>;
    deleteAssignment: (assignmentId: string) => Promise<void>;
    getAssignmentsForDateRange: (startDate: string, endDate: string) => ICruiseAssignment[];
    getEventsForDateRange: (startDate: string, endDate: string) => ICalendarEvent[];
    setCurrentView: (view: ICalendarView) => void;
}

export interface IAssignmentFormData {
    cruiseLineId: string;
    shipId: string;
    startDate: string;
    endDate: string;
    description?: string;
}

export interface ICalendarProps {
    assignments: ICruiseAssignment[];
    onAssignmentClick?: (assignment: ICruiseAssignment) => void;
    onDateClick?: (date: string) => void;
    onAddAssignment?: (date: string) => void;
    className?: string;
}
