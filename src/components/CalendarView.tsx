import { ICruiseAssignment } from "../types/calendar";
import { formatDateRange, getDaysDifference } from "../data/calendar-data";
import { HiPencil, HiCalendar } from "react-icons/hi";

interface CalendarViewProps {
    onAddAssignment?: () => void;
    onEditAssignment?: (assignment: ICruiseAssignment) => void;
    className?: string;
}

export const CalendarView = ({ 
    onAddAssignment, 
    onEditAssignment,
    className = ""
}: CalendarViewProps) => {
    // TODO: Implement Firebase calendar functionality
    const assignments: ICruiseAssignment[] = [];
    const cruiseLines: any[] = [];
    const allShips: any[] = [];

    const getStatusColor = (status: ICruiseAssignment['status']) => {
        switch (status) {
            case 'current': return 'bg-green-100 text-green-800 border-green-200';
            case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getShipName = (assignment: ICruiseAssignment) => {
        const ship = allShips.find(s => s.id === assignment.shipId);
        return ship?.name || 'Unknown Ship';
    };

    const getCruiseLineName = (assignment: ICruiseAssignment) => {
        const cruiseLine = cruiseLines.find(cl => cl.id === assignment.cruiseLineId);
        return cruiseLine?.name || 'Unknown Cruise Line';
    };

    // Sort assignments by start date (upcoming first, then current, then completed)
    const sortedAssignments = [...assignments].sort((a, b) => {
        // Current assignments first
        if (a.status === 'current' && b.status !== 'current') return -1;
        if (b.status === 'current' && a.status !== 'current') return 1;
        
        // Then upcoming assignments
        if (a.status === 'upcoming' && b.status === 'completed') return -1;
        if (b.status === 'upcoming' && a.status === 'completed') return 1;
        
        // Within same status, sort by start date
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return (
        <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#069B93] rounded-lg">
                            <HiCalendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#069B93]">My Cruise Schedule</h2>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Your upcoming and current cruise assignments
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onAddAssignment}
                        className="w-full sm:w-auto px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium text-sm sm:text-base"
                    >
                        + Add Assignment
                    </button>
                </div>
            </div>

            {/* Assignments List */}
            <div className="p-4 sm:p-6">
                {sortedAssignments.length === 0 ? (
                    <div className="text-center py-12">
                        <HiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                        <p className="text-gray-500">Add your first cruise assignment to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedAssignments.map(assignment => (
                            <div
                                key={assignment.id}
                                className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    {/* Assignment Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {getShipName(assignment)}
                                            </h3>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                            </span>
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 mb-2">
                                            {getCruiseLineName(assignment)}
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <span className="font-medium">Dates:</span>
                                                <span>{formatDateRange(assignment.startDate, assignment.endDate)}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <span className="font-medium">Duration:</span>
                                                <span>{getDaysDifference(assignment.startDate, assignment.endDate)} days</span>
                                            </div>
                                        </div>
                                        
                                        {assignment.description && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                <span className="font-medium">Notes:</span> {assignment.description}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Edit Button */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => onEditAssignment?.(assignment)}
                                            className="flex items-center space-x-2 px-3 py-2 text-[#069B93] hover:text-[#058a7a] hover:bg-white rounded-lg transition-colors"
                                        >
                                            <HiPencil className="w-4 h-4" />
                                            <span className="text-sm font-medium">Edit</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
