/**
 * Application Constants
 * 
 * Centralized constants for the CrewVar application
 */

// API Configuration
export const API_CONFIG = {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

// Firebase Collections
export const COLLECTIONS = {
    USERS: 'users',
    CHAT_ROOMS: 'chatRooms',
    CHAT_MESSAGES: 'chatMessages',
    NOTIFICATIONS: 'notifications',
    CONNECTIONS: 'connections',
    CONNECTION_REQUESTS: 'connectionRequests',
    CRUISE_LINES: 'cruiseLines',
    SHIPS: 'ships',
    DEPARTMENTS: 'departments',
    ROLES: 'roles',
    REPORTS: 'reports',
    SUPPORT_TICKETS: 'supportTickets',
} as const;

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
    CONNECTION_REQUEST: 'connection_request',
    MESSAGE: 'message',
    SYSTEM: 'system',
    ADMIN: 'admin',
} as const;

// Chat Message Types
export const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
} as const;

// Connection Status
export const CONNECTION_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    BLOCKED: 'blocked',
} as const;

// Report Status
export const REPORT_STATUS = {
    PENDING: 'pending',
    IN_REVIEW: 'in_review',
    RESOLVED: 'resolved',
    DISMISSED: 'dismissed',
} as const;

// Support Ticket Status
export const TICKET_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    DEFAULT_PAGE: 1,
} as const;

// File Upload
export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    MAX_FILES: 5,
} as const;

// UI Constants
export const UI = {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    TOAST_DURATION: 3500,
} as const;

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    DASHBOARD: '/dashboard',
    PROFILE: '/my-profile',
    CHAT: '/chat',
    EXPLORE: '/explore-ships',
    NOTIFICATIONS: '/notifications',
    ADMIN: '/admin',
    SUPPORT: '/support',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTH_ERROR: 'Authentication failed. Please try again.',
    PERMISSION_ERROR: 'You do not have permission to perform this action.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    PROFILE_UPDATED: 'Profile updated successfully.',
    CONNECTION_SENT: 'Connection request sent.',
    MESSAGE_SENT: 'Message sent successfully.',
    NOTIFICATION_SENT: 'Notification sent successfully.',
    DATA_SAVED: 'Data saved successfully.',
} as const;
