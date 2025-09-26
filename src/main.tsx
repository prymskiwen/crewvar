import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/styles/styles.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { persistor } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Removed axios import - now using Firebase

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
                    <PersistGate loading={null} persistor={persistor}>
                        <App />
                    </PersistGate>
                </Provider>
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);
