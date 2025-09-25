import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import { OnboardingGuardProvider } from "./context/OnboardingGuardContext";
import { CalendarProvider } from "./context/CalendarContext";
import { NotificationProvider } from "./context/NotificationContext";
import { RealtimeProvider } from "./context/RealtimeContext";
import { QuickCheckInProvider } from "./context/QuickCheckInContext";
import { PortConnectionProvider } from "./context/PortConnectionContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { AppRoutes } from "./routes";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { AdminGuard } from "./components/AdminGuard";
import { QuickCheckIn } from "./components/QuickCheckIn";
import { BanGuard } from "./components/BanGuard";
import { useBanNotifications } from "./hooks/useBanNotifications";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { useQuickCheckIn } from "./context/QuickCheckInContext";

const AppContent = () => {
    const { showCheckInDialog, currentShip, confirmShipAssignment, isLoading, onClose } = useQuickCheckIn();
    
    // Initialize ban notifications
    useBanNotifications();
    
    return (
        <>
            <ScrollToTop />
            <BanGuard>
                <OnboardingGuard>
                    <AdminGuard>
                        <AppRoutes />
                    </AdminGuard>
                </OnboardingGuard>
            </BanGuard>
            
            {/* Footer - appears on all pages */}
            <Footer />
            
            {/* Quick Check-in Dialog */}
            <QuickCheckIn
                isOpen={showCheckInDialog}
                onClose={onClose}
                onConfirm={confirmShipAssignment}
                currentShip={currentShip?.shipId}
                isLoading={isLoading}
            />
        </>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <RealtimeProvider>
                <OnboardingGuardProvider>
                    <CalendarProvider>
                        <NotificationProvider>
                            <QuickCheckInProvider>
                                <PortConnectionProvider>
                                    <FavoritesProvider>
                                        <ToastContainer 
                                            autoClose={3500}
                                            draggable={false}
                                            pauseOnHover={false}
                                        />
                                        <AppContent />
                                    </FavoritesProvider>
                                </PortConnectionProvider>
                            </QuickCheckInProvider>
                        </NotificationProvider>
                    </CalendarProvider>
                </OnboardingGuardProvider>
            </RealtimeProvider>
        </AuthProvider>
    );
};

export default App;