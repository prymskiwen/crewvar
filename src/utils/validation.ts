/**
 * Validation Utilities
 * 
 * Centralized validation functions and schemas for the CrewVar application
 */

import * as yup from 'yup';
import { ERROR_MESSAGES } from '../constants';

/**
 * Common validation rules
 */
export const validationRules = {
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),

    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('Password is required'),

    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),

    displayName: yup
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .required('Name is required'),

    phone: yup
        .string()
        .matches(
            /^\+?[\d\s\-\(\)]+$/,
            'Please enter a valid phone number'
        )
        .min(10, 'Phone number must be at least 10 digits'),

    bio: yup
        .string()
        .max(500, 'Bio must be less than 500 characters'),

    website: yup
        .string()
        .url('Please enter a valid URL'),

    socialMedia: yup
        .string()
        .matches(
            /^[a-zA-Z0-9._-]+$/,
            'Username can only contain letters, numbers, dots, underscores, and hyphens'
        ),
};

/**
 * Authentication schemas
 */
export const authSchemas = {
    login: yup.object({
        email: validationRules.email,
        password: yup.string().required('Password is required'),
    }),

    signup: yup.object({
        email: validationRules.email,
        password: validationRules.password,
        confirmPassword: validationRules.confirmPassword,
        displayName: validationRules.displayName,
        agreeToTerms: yup
            .boolean()
            .oneOf([true], 'You must agree to the terms and conditions'),
    }),

    resetPassword: yup.object({
        email: validationRules.email,
    }),

    changePassword: yup.object({
        currentPassword: yup.string().required('Current password is required'),
        newPassword: validationRules.password,
        confirmPassword: validationRules.confirmPassword,
    }),
};

/**
 * Profile schemas
 */
export const profileSchemas = {
    basicInfo: yup.object({
        displayName: validationRules.displayName,
        bio: validationRules.bio,
        phone: validationRules.phone,
        website: validationRules.website,
    }),

    socialMedia: yup.object({
        instagram: validationRules.socialMedia,
        twitter: validationRules.socialMedia,
        facebook: validationRules.socialMedia,
        snapchat: validationRules.socialMedia,
    }),

    shipAssignment: yup.object({
        currentShipId: yup.string().required('Please select a ship'),
        departmentId: yup.string().required('Please select a department'),
        roleId: yup.string().required('Please select a role'),
    }),
};

/**
 * Chat schemas
 */
export const chatSchemas = {
    message: yup.object({
        content: yup
            .string()
            .required('Message cannot be empty')
            .max(1000, 'Message must be less than 1000 characters'),
        type: yup
            .string()
            .oneOf(['text', 'image', 'file'], 'Invalid message type'),
    }),

    room: yup.object({
        name: yup
            .string()
            .min(2, 'Room name must be at least 2 characters')
            .max(50, 'Room name must be less than 50 characters'),
        description: yup
            .string()
            .max(200, 'Description must be less than 200 characters'),
    }),
};

/**
 * Connection schemas
 */
export const connectionSchemas = {
    request: yup.object({
        message: yup
            .string()
            .max(200, 'Message must be less than 200 characters'),
    }),

    response: yup.object({
        action: yup
            .string()
            .oneOf(['accept', 'reject'], 'Invalid action'),
        message: yup
            .string()
            .max(200, 'Message must be less than 200 characters'),
    }),
};

/**
 * Admin schemas
 */
export const adminSchemas = {
    user: yup.object({
        email: validationRules.email,
        displayName: validationRules.displayName,
        isActive: yup.boolean(),
        isAdmin: yup.boolean(),
    }),

    report: yup.object({
        reason: yup
            .string()
            .required('Please select a reason')
            .oneOf([
                'inappropriate_content',
                'harassment',
                'spam',
                'fake_profile',
                'other'
            ], 'Invalid reason'),
        description: yup
            .string()
            .required('Please provide a description')
            .max(500, 'Description must be less than 500 characters'),
    }),

    supportTicket: yup.object({
        subject: yup
            .string()
            .required('Subject is required')
            .max(100, 'Subject must be less than 100 characters'),
        description: yup
            .string()
            .required('Description is required')
            .max(1000, 'Description must be less than 1000 characters'),
        priority: yup
            .string()
            .oneOf(['low', 'medium', 'high', 'urgent'], 'Invalid priority'),
    }),
};

/**
 * File upload schemas
 */
export const fileSchemas = {
    image: yup.object({
        file: yup
            .mixed()
            .required('Please select a file')
            .test('fileSize', 'File size must be less than 10MB', (value) => {
                if (!value) return true;
                return value.size <= 10 * 1024 * 1024;
            })
            .test('fileType', 'Only image files are allowed', (value) => {
                if (!value) return true;
                return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(value.type);
            }),
    }),

    document: yup.object({
        file: yup
            .mixed()
            .required('Please select a file')
            .test('fileSize', 'File size must be less than 10MB', (value) => {
                if (!value) return true;
                return value.size <= 10 * 1024 * 1024;
            })
            .test('fileType', 'Only document files are allowed', (value) => {
                if (!value) return true;
                return [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain'
                ].includes(value.type);
            }),
    }),
};

/**
 * Custom validation functions
 */
export const customValidators = {
    /**
     * Validate password strength
     */
    passwordStrength: (password: string): { score: number; feedback: string[] } => {
        const feedback: string[] = [];
        let score = 0;

        if (password.length >= 8) score += 1;
        else feedback.push('Use at least 8 characters');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Use lowercase letters');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Use uppercase letters');

        if (/\d/.test(password)) score += 1;
        else feedback.push('Use numbers');

        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        else feedback.push('Use special characters');

        return { score, feedback };
    },

    /**
     * Validate email format
     */
    isValidEmail: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate phone number format
     */
    isValidPhone: (phone: string): boolean => {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    /**
     * Validate URL format
     */
    isValidUrl: (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Validate social media username
     */
    isValidSocialUsername: (username: string): boolean => {
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        return usernameRegex.test(username) && username.length >= 2;
    },
};

/**
 * Validation error formatter
 */
export const formatValidationError = (error: yup.ValidationError): string => {
    if (error.message) {
        return error.message;
    }

    if (error.errors && error.errors.length > 0) {
        return error.errors[0];
    }

    return ERROR_MESSAGES.VALIDATION_ERROR;
};

/**
 * Validate form data with schema
 */
export const validateForm = async <T>(
    schema: yup.ObjectSchema<any>,
    data: T
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
        await schema.validate(data, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const errors: Record<string, string> = {};
            error.inner.forEach((err) => {
                if (err.path) {
                    errors[err.path] = err.message;
                }
            });
            return { isValid: false, errors };
        }
        return { isValid: false, errors: { general: ERROR_MESSAGES.VALIDATION_ERROR } };
    }
};

export default {
    rules: validationRules,
    auth: authSchemas,
    profile: profileSchemas,
    chat: chatSchemas,
    connection: connectionSchemas,
    admin: adminSchemas,
    file: fileSchemas,
    custom: customValidators,
    formatError: formatValidationError,
    validate: validateForm,
};
