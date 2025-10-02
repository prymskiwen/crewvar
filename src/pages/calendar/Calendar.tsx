import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { HiPlus, HiArrowLeft } from 'react-icons/hi';
import { CalendarView, AssignmentForm } from '../../components/common';
import { ICruiseAssignment } from '../../types/calendar';
import { useAuth } from '../../context/AuthContextFirebase';

export const CalendarPage = () => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<ICruiseAssignment | null>(null);

    const handleAddAssignment = () => {
        setEditingAssignment(null);
        setShowAssignmentForm(true);
    };

    const handleEditAssignment = (assignment: ICruiseAssignment) => {
        setEditingAssignment(assignment);
        setShowAssignmentForm(true);
    };

    const handleCloseForm = () => {
        setShowAssignmentForm(false);
        setEditingAssignment(null);
    };

    const handleAssignmentSuccess = () => {
        // Refresh assignments when one is added/updated
        queryClient.invalidateQueries({ queryKey: ['userAssignments', currentUser?.uid] });
        console.log('📅 Assignment saved successfully - refreshing list');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/profile"
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <HiArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
                        </div>

                        <button
                            onClick={handleAddAssignment}
                            className="flex items-center space-x-2 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors"
                        >
                            <HiPlus className="w-4 h-4" />
                            <span>Add Assignment</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {showAssignmentForm ? (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <AssignmentForm
                            editingAssignment={editingAssignment}
                            onClose={handleCloseForm}
                            onSuccess={handleAssignmentSuccess}
                        />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <CalendarView
                            onAddAssignment={handleAddAssignment}
                            onEditAssignment={handleEditAssignment}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
