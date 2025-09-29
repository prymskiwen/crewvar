import React, { useState, useEffect } from 'react';
import AppBar from './AppBar';
import DashboardSidebar from './DashboardSidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContextFirebase';
import { QuickCheckInDialog } from '../components/common/QuickCheckInDialog';

interface ShipAssignment {
    shipId: string;
    shipName: string;
    port: string;
    date: string; // YYYY-MM-DD format
    isConfirmed: boolean;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { userProfile } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [currentShip, setCurrentShip] = useState<ShipAssignment | null>(null);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Check if user needs to confirm ship assignment on login
    useEffect(() => {
        // Only check if user profile is loaded
        if (!userProfile) return;

        // Check if onboarding is complete
        const isOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

        // Only show quick check-in for users who have completed onboarding
        if (isOnboardingComplete) {
            // Check if we've already shown quick check-in today
            const today = new Date().toDateString(); // e.g., "Mon Dec 23 2024"
            const lastCheckInDate = localStorage.getItem('lastQuickCheckInDate');

            if (lastCheckInDate !== today) {
                console.log('First visit today, showing quick check-in');
                setShowCheckInDialog(true);
                // Mark that we've shown it today
                localStorage.setItem('lastQuickCheckInDate', today);
            } else {
                console.log('Already shown quick check-in today, skipping');
                setShowCheckInDialog(false);
            }
        } else {
            console.log('User has not completed onboarding, skipping quick check-in');
            setShowCheckInDialog(false);
        }

        // Load saved ship assignment if available
        const savedShip = localStorage.getItem('currentShipAssignment');
        if (savedShip) {
            setCurrentShip(JSON.parse(savedShip));
        }
    }, [userProfile]);

    // TODO: Implement Firebase ship assignment update function when needed
    // This will be used for confirming ship assignments in the future

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Internal App Bar */}
            <AppBar onToggleSidebar={toggleSidebar} />

            <div className="flex flex-1">
                {/* Internal Sidebar */}
                <DashboardSidebar
                    isOpen={sidebarOpen}
                    onToggle={toggleSidebar}
                    setShowCheckInDialog={setShowCheckInDialog}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Page Content */}
                    <div className="p-3 sm:p-4 lg:p-6 xl:p-8 flex-1 lg:ml-80">
                        {children}
                    </div>

                    {/* Footer */}
                    <Footer />
                </div>
            </div>

            {/* Quick Check-In Dialog */}
            <QuickCheckInDialog
                isOpen={showCheckInDialog}
                onClose={() => setShowCheckInDialog(false)}
                currentShip={currentShip}
            />
        </div>
    );
};
