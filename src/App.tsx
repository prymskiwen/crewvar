import React from "react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContextFirebase";
import { RealtimeProvider } from "./context/RealtimeContextFirebase";
import { AppRoutes } from "./routes";
import { AuthGuard, BanGuard, ConditionalGuards } from "./guards";
import { ErrorBoundary } from "./components/ui";
import { Footer, ScrollToTop } from "./components/layout";

const AppContent = React.memo(() => {
    return (
        <RealtimeProvider>
            <ErrorBoundary>
                <ScrollToTop />
                <AuthGuard>
                    <BanGuard>
                        <ConditionalGuards>
                            <AppRoutes />
                        </ConditionalGuards>
                    </BanGuard>
                </AuthGuard>

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