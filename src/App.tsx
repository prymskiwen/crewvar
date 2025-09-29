import React from "react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContextFirebase";
import { RealtimeProvider } from "./context/RealtimeContextFirebase";
import { AppRoutes } from "./routes";
import { AuthGuard, BanGuard, ConditionalGuards } from "./guards";
import { ErrorBoundary } from "./components/ui";
import { ScrollToTop } from "./layout";

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
                enableMultiContainer={false}
                closeOnClick={true}
                newestOnTop={true}
                position="top-right"
                hideProgressBar={false}
                rtl={false}
                limit={5}
                style={{
                    touchAction: 'manipulation'
                }}
            />
            <AppContent />
        </AuthProvider>
    );
});

export default App;