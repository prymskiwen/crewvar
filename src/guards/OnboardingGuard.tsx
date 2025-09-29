import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContextFirebase";
import { LoadingPage } from "../components/ui";

import { OnboardingGuardProps } from '../types';

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser, userProfile, loading: authLoading } = useAuth();

    // Set loading state based on auth loading
    useEffect(() => {
        if (!authLoading) {
            setIsLoading(false);
        }
    }, [authLoading]);

    // Check if user is admin (from user profile, not Firebase user)
    // Also check email as fallback for admin@crewvar.com
    const isAdmin = userProfile?.isAdmin === true || currentUser?.email === 'admin@crewvar.com';

    // Debug logging for admin detection
    console.log('OnboardingGuard - Debug Info:', {
        currentUser: !!currentUser,
        userProfile: !!userProfile,
        isAdmin: isAdmin,
        userProfileIsAdmin: userProfile?.isAdmin,
        userEmail: currentUser?.email,
        pathname: location.pathname
    });

    // Check if user profile is complete based on actual data
    const isProfileComplete = userProfile &&
        userProfile.displayName &&
        userProfile.profilePhoto &&
        userProfile.departmentId &&
        userProfile.roleId &&
        userProfile.currentShipId;

    // Check if onboarding is marked as complete in localStorage
    const isOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

    // For new users (no profile data or incomplete profile), they should go to onboarding
    // BUT admins skip onboarding entirely
    const isNewUser = !isAdmin && (!userProfile || !isProfileComplete);

    // Check if email is verified (only for authenticated users)
    // Temporarily disabled for production deployment
    const isEmailVerified = true;

    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/signup',
        '/auth/verify-email',
        '/auth/verification-pending',
        '/onboarding'
    ];

    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route =>
        location.pathname === route || location.pathname.startsWith(route + '/')
    );


    useEffect(() => {
        // Don't redirect while loading
        if (isLoading || authLoading) return;

        // Check if AssignmentForm is open - if so, don't redirect
        const assignmentFormOpen = localStorage.getItem('assignmentFormOpen') === 'true';
        if (assignmentFormOpen) {
            console.log('AssignmentForm is open, skipping redirect');
            return;
        }

        // If not authenticated and trying to access protected route, redirect to login
        if (!currentUser && !isPublicRoute) {
            console.log('No user logged in, redirecting to login');
            navigate('/auth/login', {
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        // If authenticated, check for admin FIRST before any other checks
        if (currentUser && !isPublicRoute) {
            // ADMIN CHECK FIRST: Skip all other logic for admin users
            // Check admin status immediately (email fallback works even without userProfile)
            if (isAdmin) {
                console.log('Admin user detected, redirecting to admin dashboard');
                if (!location.pathname.startsWith('/admin')) {
                    console.log('Redirecting admin user from', location.pathname, 'to /admin');
                    navigate('/admin', {
                        replace: true,
                        state: {
                            from: location.pathname,
                            reason: 'Admin user redirected to admin dashboard'
                        }
                    });
                }
                return;
            }

            // If email is not verified, redirect to verification pending page
            if (!isEmailVerified) {
                console.log('Email not verified, redirecting to verification pending');
                navigate('/auth/verification-pending', {
                    replace: true,
                    state: {
                        from: location.pathname,
                        email: currentUser.email
                    }
                });
                return;
            }

            // REGULAR USER LOGIC: If email is verified but profile is not complete, redirect to onboarding
            // Add a small delay to prevent race conditions with profile updates
            if (isNewUser && !isOnboardingComplete) {
                console.log('New user or incomplete profile, redirecting to onboarding');
                console.log('Profile data:', userProfile);
                console.log('Is profile complete:', isProfileComplete);
                console.log('Is new user:', isNewUser);
                console.log('Onboarding complete flag:', isOnboardingComplete);

                // Only redirect if we're not already on the onboarding page
                if (location.pathname !== '/onboarding') {
                    navigate('/onboarding', {
                        replace: true,
                        state: {
                            from: location.pathname
                        }
                    });
                }
                return;
            }

            // If onboarding is marked as complete, allow navigation to dashboard
            if (isOnboardingComplete) {
                console.log('Onboarding marked as complete, allowing navigation to dashboard');
                return;
            }
        }
    }, [isLoading, authLoading, currentUser, isPublicRoute, isEmailVerified, isProfileComplete, isOnboardingComplete, isNewUser, userProfile, navigate, location.pathname, isAdmin]);

    // Show loading while checking authentication
    if (authLoading) {
        return <LoadingPage message="Loading..." showLogo={true} />;
    }


    return <>{children}</>;
};