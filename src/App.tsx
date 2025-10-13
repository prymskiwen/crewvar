import React from "react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContextFirebase";
import { RealtimeProvider } from "./context/RealtimeContextFirebase";
import { AppRoutes } from "./routes";
import { AuthGuard, BanGuard, ConditionalGuards } from "./guards";
import { ErrorBoundary } from "./components/ui";
import { ScrollToTop } from "./layout";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

if (typeof window !== "undefined") {
  GoogleAuth.initialize({
    clientId: import.meta.env.VITE_WEB_CLIENT_ID,
    scopes: ["profile", "email"],
    grantOfflineAccess: true,
  });
}

const AppContent = React.memo(() => {
  return (
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
  );
});

const App = React.memo(() => {
  return (
    <AuthProvider>
      <RealtimeProvider>
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
            touchAction: "manipulation",
          }}
        />
        <AppContent />
      </RealtimeProvider>
    </AuthProvider>
  );
});

export default App;
