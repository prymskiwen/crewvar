import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ICruiseAssignment, ICalendarEvent, ICalendarView, ICalendarContext } from "../types/calendar";
import { 
    sampleAssignments,
    sampleEvents,
    addAssignment,
    updateAssignment,
    deleteAssignment
} from "../data/calendar-data";

const CalendarContext = createContext<ICalendarContext | undefined>(undefined);

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};

interface CalendarProviderProps {
    children: ReactNode;
}

export const CalendarProvider = ({ children }: CalendarProviderProps) => {
    const [assignments, setAssignments] = useState<ICruiseAssignment[]>(sampleAssignments);
    const [events, setEvents] = useState<ICalendarEvent[]>(sampleEvents);
    const [currentView, setCurrentView] = useState<ICalendarView>({
        view: 'month',
        currentDate: new Date().toISOString().split('T')[0]
    });

    // Load initial data
    useEffect(() => {
        setAssignments(sampleAssignments);
        setEvents(sampleEvents);
    }, []);

    const addAssignmentHandler = async (assignmentData: Omit<ICruiseAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newAssignment = addAssignment(assignmentData);
            setAssignments(prev => [...prev, newAssignment]);
            
            console.log('Assignment added successfully:', newAssignment);
        } catch (error) {
            console.error('Failed to add assignment:', error);
            throw error;
        }
    };

    const updateAssignmentHandler = async (assignmentId: string, updates: Partial<ICruiseAssignment>): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedAssignment = updateAssignment(assignmentId, updates);
            if (!updatedAssignment) throw new Error('Assignment not found');
            
            setAssignments(prev => prev.map(assignment => 
                assignment.id === assignmentId ? updatedAssignment : assignment
            ));
            
            console.log('Assignment updated successfully:', updatedAssignment);
        } catch (error) {
            console.error('Failed to update assignment:', error);
            throw error;
        }
    };

    const deleteAssignmentHandler = async (assignmentId: string): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const success = deleteAssignment(assignmentId);
            if (!success) throw new Error('Assignment not found');
            
            setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
            
            console.log('Assignment deleted successfully');
        } catch (error) {
            console.error('Failed to delete assignment:', error);
            throw error;
        }
    };

    const getAssignmentsForDateRangeHandler = (startDate: string, endDate: string): ICruiseAssignment[] => {
        return assignments.filter(assignment => {
            const assignmentStart = new Date(assignment.startDate);
            const assignmentEnd = new Date(assignment.endDate);
            const rangeStart = new Date(startDate);
            const rangeEnd = new Date(endDate);
            
            return assignmentStart <= rangeEnd && assignmentEnd >= rangeStart;
        });
    };

    const getEventsForDateRangeHandler = (startDate: string, endDate: string): ICalendarEvent[] => {
        return events.filter(event => {
            const eventDate = new Date(event.start);
            const rangeStart = new Date(startDate);
            const rangeEnd = new Date(endDate);
            
            return eventDate >= rangeStart && eventDate <= rangeEnd;
        });
    };

    const setCurrentViewHandler = (view: ICalendarView) => {
        setCurrentView(view);
    };

    const value: ICalendarContext = {
        assignments,
        events,
        currentView,
        addAssignment: addAssignmentHandler,
        updateAssignment: updateAssignmentHandler,
        deleteAssignment: deleteAssignmentHandler,
        getAssignmentsForDateRange: getAssignmentsForDateRangeHandler,
        getEventsForDateRange: getEventsForDateRangeHandler,
        setCurrentView: setCurrentViewHandler
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
};
