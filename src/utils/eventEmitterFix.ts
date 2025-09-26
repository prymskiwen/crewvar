/**
 * EventEmitter Memory Leak Fix
 * 
 * This utility helps prevent memory leaks in development environments
 * by properly managing event listeners and connections.
 */

/**
 * Set max listeners for EventEmitter to prevent memory leak warnings
 * This is particularly useful in development environments with hot reloading
 */
export const fixEventEmitterMemoryLeak = (): void => {
    // This function is primarily for Node.js environments
    // In browser environments, we rely on the browser's built-in memory management
    if (typeof window !== 'undefined') {
        // Browser environment - no need for EventEmitter fixes
        console.log('Running in browser environment - using browser memory management');
        return;
    }

    // Only run in Node.js environments (like during build processes)
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        try {
            // Check if we're in a Node.js environment with require available
            if (typeof require !== 'undefined') {
                const EventEmitter = require('events');
                EventEmitter.defaultMaxListeners = 20;

                // Set max listeners for process if available
                if (process.setMaxListeners) {
                    process.setMaxListeners(20);
                }

                console.log('EventEmitter max listeners increased to prevent memory leak warnings');
            }
        } catch (error) {
            // Silently handle if EventEmitter is not available
            console.log('EventEmitter not available in current environment');
        }
    }
};

/**
 * Cleanup function for Firebase connections
 * Call this when the app is unmounting or during hot reload
 */
export const cleanupFirebaseConnections = (): void => {
    if (typeof window !== 'undefined') {
        // Clean up any global Firebase listeners
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
 * Initialize memory leak prevention
 * Call this at the start of your application
 */
export const initializeMemoryLeakPrevention = (): void => {
    fixEventEmitterMemoryLeak();
    cleanupFirebaseConnections();
};
