import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContextFirebase";
import { RealtimeProvider } from "./context/RealtimeContextFirebase";
import { AppRoutes } from "./routes";
import { OnboardingGuard, AdminGuard, BanGuard } from "./guards";
import { ErrorBoundary } from "./components/ui";
import { Footer, ScrollToTop } from "./components/layout";

const AppContent = () => {
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