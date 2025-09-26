import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContextFirebase";
import { RealtimeProvider } from "./context/RealtimeContextFirebase";
import { AppRoutes } from "./routes";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { AdminGuard } from "./components/AdminGuard";
import { BanGuard } from "./components/BanGuard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useBanNotifications } from "./hooks/useBanNotifications";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

const AppContent = () => {
    // Initialize ban notifications
    useBanNotifications();

    return (
        <ErrorBoundary>
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
        </ErrorBoundary>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <RealtimeProvider>
                <ToastContainer
                    autoClose={3500}
                    draggable={false}
                    pauseOnHover={false}
                />
                <AppContent />
            </RealtimeProvider>
        </AuthProvider>
    );
};

export default App;