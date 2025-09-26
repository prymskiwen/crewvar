/**
 * Browser Memory Management
 * 
 * This utility helps manage memory in browser environments
 * by providing cleanup functions and memory management utilities.
 */

/**
 * Cleanup function for browser event listeners
 * Call this when components unmount or during navigation
 */
export const cleanupBrowserEventListeners = (): void => {
    if (typeof window !== 'undefined') {
        // Clean up any global event listeners
        const cleanup = () => {
            // Remove any global event listeners
            window.removeEventListener('beforeunload', cleanup);
            window.removeEventListener('unload', cleanup);
        };

        window.addEventListener('beforeunload', cleanup);
        window.addEventListener('unload', cleanup);
    }
};

/**
 * Initialize browser memory management
 * Call this at the start of your application
 */
export const initializeBrowserMemoryManagement = (): void => {
    if (typeof window !== 'undefined') {
        console.log('Initializing browser memory management');
        cleanupBrowserEventListeners();
    }
};
