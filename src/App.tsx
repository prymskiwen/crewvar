import React from "react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContextFirebase";
import { RealtimeProvider } from "./context/RealtimeContextFirebase";
import { AppRoutes } from "./routes";
import { OnboardingGuard, AdminGuard, BanGuard } from "./guards";
import { ErrorBoundary } from "./components/ui";
import { Footer, ScrollToTop, AppBar } from "./components/layout";

const AppContent = React.memo(() => {
    return (
        <RealtimeProvider>
            <ErrorBoundary>
                <ScrollToTop />
                <AppBar />
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
        </RealtimeProvider>
    );
});

const App = React.memo(() => {
    return (
        <AuthProvider>
            <ToastContainer
                autoClose={3500}
                draggable={false}
                pauseOnHover={false}
            />
            <AppContent />
        </AuthProvider>
    );
});

export default App;