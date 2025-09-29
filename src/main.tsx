import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { PersistGate } from "redux-persist/integration/react";
import { toast } from "react-toastify";
import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

import { persistor, store } from "./app/store";
import { initializeBrowserMemoryManagement } from "./utils/browser";
import { LoadingPage } from "./components/ui";

import App from "./App";

import "react-toastify/dist/ReactToastify.css";
import "./assets/styles/styles.css";
// Removed axios import - now using Firebase

// Initialize browser memory management
initializeBrowserMemoryManagement();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                // Don't retry on Firebase auth errors
                if (error instanceof Error && error.message.includes('auth/')) {
                    return false;
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
            if (error instanceof Error) {
                // Don't show toast for Firebase auth errors to avoid spam
                if (error.message.includes('auth/')) {
                    return;
                }
                toast.error(error.message);
            }
        },
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            if (error instanceof Error) {
                // Don't show toast for Firebase auth errors to avoid spam
                if (error.message.includes('auth/')) {
                    return;
                }
                toast.error(error.message);
            }
        },
    }),
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <PersistGate loading={<LoadingPage message="Loading..." showLogo={true} />} persistor={persistor}>
                        <App />
                    </PersistGate>
                </Provider>
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);
