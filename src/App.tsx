import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import { QuickCheckInProvider } from "./context/QuickCheckInContext";
import { ChatProvider } from "./context/ChatContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { PrivacyProvider } from "./context/PrivacyContext";
import { OnboardingGuardProvider } from "./context/OnboardingGuardContext";
import { ModerationProvider } from "./context/ModerationContext";
import { CalendarProvider } from "./context/CalendarContext";
import { PortConnectionProvider } from "./context/PortConnectionContext";
import { AppRoutes } from "./routes";
import { QuickCheckIn } from "./components/QuickCheckIn";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { useQuickCheckIn } from "./context/QuickCheckInContext";

const AppContent = () => {
    const { showCheckInDialog, onClose, confirmShipAssignment, isLoading } = useQuickCheckIn();

    return (
        <>
            <OnboardingGuard>
                <AppRoutes />
            </OnboardingGuard>
            <QuickCheckIn
                isOpen={showCheckInDialog}
                onClose={() => onClose()}
                onConfirm={confirmShipAssignment}
                isLoading={isLoading}
            />
        </>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <QuickCheckInProvider>
                <ChatProvider>
                    <FavoritesProvider>
                        <PrivacyProvider>
                            <OnboardingGuardProvider>
                                <ModerationProvider>
                                    <CalendarProvider>
                                        <PortConnectionProvider>
                                            <ToastContainer 
                                                autoClose={3500}
                                                draggable={false}
                                                pauseOnHover={false}
                                            />
                                            <AppContent />
                                        </PortConnectionProvider>
                                    </CalendarProvider>
                                </ModerationProvider>
                            </OnboardingGuardProvider>
                        </PrivacyProvider>
                    </FavoritesProvider>
                </ChatProvider>
            </QuickCheckInProvider>
        </AuthProvider>
    );
};

export default App;