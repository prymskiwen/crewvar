import { useState } from 'react';
import { OnboardingForm, CalendarView, AssignmentForm } from "../../components/common";
import { ICruiseAssignment } from "../../types/calendar";
import logo from "../../assets/images/Home/logo.png";

export const Onboarding = () => {
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

    const handleCloseAssignmentForm = () => {
        setShowAssignmentForm(false);
        setEditingAssignment(null);
    };
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <div className="min-h-screen py-4 sm:py-12 px-2 sm:px-4 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <img
                            src={logo}
                            alt="Crewvar Logo"
                            className="h-12 sm:h-16 w-auto mx-auto mb-3 sm:mb-4"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Onboarding Form */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-12">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#069B93] mb-6">
                                Profile Information
                            </h2>
                            <OnboardingForm />
                        </div>

                        {/* Calendar Section */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-12">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#069B93] mb-6">
                                Cruise Schedule
                            </h2>
                            <CalendarView 
                                onAddAssignment={handleAddAssignment}
                                onEditAssignment={handleEditAssignment}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment Form Modal */}
            {showAssignmentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <AssignmentForm
                            onClose={handleCloseAssignmentForm}
                            onSuccess={() => {
                                setShowAssignmentForm(false);
                                setEditingAssignment(null);
                            }}
                            editingAssignment={editingAssignment}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
