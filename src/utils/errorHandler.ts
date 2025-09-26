/**
 * Error Handling Utilities
 * 
 * Centralized error handling for the CrewVar application
 */

import { toast } from 'react-toastify';
import { ERROR_MESSAGES } from '../constants';

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode?: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        code: string = 'UNKNOWN_ERROR',
        statusCode?: number,
        isOperational: boolean = true
    ) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error types for better error handling
 */
export enum ErrorType {
    NETWORK = 'NETWORK_ERROR',
    AUTH = 'AUTH_ERROR',
    VALIDATION = 'VALIDATION_ERROR',
    PERMISSION = 'PERMISSION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    SERVER = 'SERVER_ERROR',
    FIREBASE = 'FIREBASE_ERROR',
    UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Error handler class for centralized error management
 */
export class ErrorHandler {
    /**
     * Handle and process errors
     * 
     * @param error - Error to handle
     * @param context - Context where error occurred
     * @param showToast - Whether to show toast notification
     */
    static handle(error: unknown, context?: string, showToast: boolean = true): AppError {
        const appError = this.normalizeError(error);

        // Log error for debugging
        console.error(`Error in ${context || 'unknown context'}:`, {
            message: appError.message,
            code: appError.code,
            stack: appError.stack,
        });

        // Show user-friendly message
        if (showToast) {
            this.showErrorToast(appError);
        }

        return appError;
    }

    /**
     * Normalize different error types to AppError
     * 
     * @param error - Error to normalize
     * @returns Normalized AppError
     */
    private static normalizeError(error: unknown): AppError {
        if (error instanceof AppError) {
            return error;
        }

        if (error instanceof Error) {
            // Firebase errors
            if (error.message.includes('auth/')) {
                return new AppError(
                    this.getFirebaseErrorMessage(error.message),
                    ErrorType.FIREBASE,
                    401
                );
            }

            // Network errors
            if (error.message.includes('Network Error') || error.message.includes('fetch')) {
                return new AppError(
                    ERROR_MESSAGES.NETWORK_ERROR,
                    ErrorType.NETWORK,
                    0
                );
            }

            // Generic error
            return new AppError(
                error.message,
                ErrorType.UNKNOWN
            );
        }

        // Unknown error type
        return new AppError(
            'An unknown error occurred',
            ErrorType.UNKNOWN
        );
    }

    /**
     * Get user-friendly error message for Firebase errors
     * 
     * @param firebaseError - Firebase error message
     * @returns User-friendly error message
     */
    private static getFirebaseErrorMessage(firebaseError: string): string {
        const errorMap: Record<string, string> = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/requires-recent-login': 'Please sign in again to complete this action.',
            'permission-denied': 'You do not have permission to perform this action.',
            'unavailable': 'Service is temporarily unavailable. Please try again later.',
        };

        for (const [key, message] of Object.entries(errorMap)) {
            if (firebaseError.includes(key)) {
                return message;
            }
        }

        return ERROR_MESSAGES.SERVER_ERROR;
    }

    /**
     * Show error toast notification
     * 
     * @param error - Error to display
     */
    private static showErrorToast(error: AppError): void {
        const message = error.isOperational ? error.message : ERROR_MESSAGES.SERVER_ERROR;

        toast.error(message, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    }

    /**
     * Create a new AppError
     * 
     * @param message - Error message
     * @param code - Error code
     * @param statusCode - HTTP status code
     * @returns New AppError instance
     */
    static create(
        message: string,
        code: string = ErrorType.UNKNOWN,
        statusCode?: number
    ): AppError {
        return new AppError(message, code, statusCode);
    }

    /**
     * Check if error is operational (expected) or programming error
     * 
     * @param error - Error to check
     * @returns True if error is operational
     */
    static isOperational(error: unknown): boolean {
        if (error instanceof AppError) {
            return error.isOperational;
        }
        return false;
    }

    /**
     * Get error code from any error type
     * 
     * @param error - Error to get code from
     * @returns Error code string
     */
    static getErrorCode(error: unknown): string {
        if (error instanceof AppError) {
            return error.code;
        }
        if (error instanceof Error) {
            return ErrorType.UNKNOWN;
        }
        return ErrorType.UNKNOWN;
    }
}

/**
 * Higher-order function for error handling in async functions
 * 
 * @param fn - Async function to wrap
 * @param context - Context for error logging
 * @returns Wrapped function with error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
): T => {
    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args);
        } catch (error) {
            throw ErrorHandler.handle(error, context);
        }
    }) as T;
};

/**
 * Error boundary component props
 */
export interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error boundary component state
 */
export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}
