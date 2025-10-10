import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { HiPlus, HiArrowLeft } from 'react-icons/hi';
import { CalendarView, AssignmentForm } from '../../components/common';
import { ConfirmationDialog } from '../../components/ui';
import { ICruiseAssignment } from '../../types/calendar';
import { useAuth } from '../../context/AuthContextFirebase';
import { deleteAssignment, getShips } from '../../firebase/firestore';
import { toast } from 'react-toastify';
import logo from '../../assets/images/Home/logo.png';

export const CalendarPage = () => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<ICruiseAssignment | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<ICruiseAssignment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch ships for name resolution
    const { data: allShips = [] } = useQuery({
        queryKey: ['ships'],
        queryFn: getShips,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const getShipName = (shipId: string) => {
        const ship = allShips.find(s => s.id === shipId);
        return ship?.name || 'Unknown Ship';
    };

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

    const handleDeleteAssignment = async (assignment: ICruiseAssignment) => {
        if (!assignment.id) {
            toast.error('Cannot delete assignment: Missing assignment ID');
            return;
        }

        setAssignmentToDelete(assignment);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!assignmentToDelete?.id) return;

        setIsDeleting(true);
        try {
            await deleteAssignment(assignmentToDelete.id);
            toast.success('Assignment deleted successfully!');
            
            // Refresh assignments list
            queryClient.invalidateQueries({ queryKey: ['userAssignments', currentUser?.uid] });
            console.log('📅 Assignment deleted successfully - refreshing list');
            
            // Close dialog
            setShowDeleteDialog(false);
            setAssignmentToDelete(null);
        } catch (error) {
            console.error('❌ Error deleting assignment:', error);
            toast.error('Failed to delete assignment. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteDialog(false);
        setAssignmentToDelete(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/dashboard"
                                    className="hover:opacity-90 transition-opacity"
                                >
                                    <img
                                        src={logo}
                                        alt="Crewvar Logo"
                                        className="h-6 w-auto max-w-[120px] object-contain"
                                    />
                                </Link>
                                <Link
                                    to="/profile"
                                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <HiArrowLeft className="w-4 h-4 text-gray-600" />
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pb-3">
                            <h1 className="text-xl font-bold text-gray-900">My Calendar</h1>
                            <button
                                onClick={handleAddAssignment}
                                className="flex items-center space-x-1 px-3 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors text-sm"
                            >
                                <HiPlus className="w-4 h-4" />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/dashboard"
                                    className="hover:opacity-90 transition-opacity"
                                >
                                    <img
                                        src={logo}
                                        alt="Crewvar Logo"
                                        className="h-8 w-auto"
                                    />
                                </Link>
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
                            onDeleteAssignment={handleDeleteAssignment}
                        />
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Assignment"
                message={
                    assignmentToDelete 
                        ? `Are you sure you want to delete this assignment?\n\n` +
                          `Ship: ${getShipName(assignmentToDelete.shipId)}\n` +
                          `Dates: ${assignmentToDelete.startDate} - ${assignmentToDelete.endDate}\n\n` +
                          `This action cannot be undone.`
                        : ''
                }
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};
