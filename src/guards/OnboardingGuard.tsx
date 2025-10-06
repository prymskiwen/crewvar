import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContextFirebase';
import { LoadingPage } from '../components/ui';

interface OnboardingGuardProps {
    children: React.ReactNode;
}

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, userProfile, loading } = useAuth();

    // Check if user is admin (skip onboarding for admins)
    const isAdmin = userProfile?.isAdmin === true;

    // Check if profile is complete
    const hasProfilePhoto = userProfile?.profilePhoto || (userProfile as any)?.profile_photo;
    const isProfileComplete = userProfile &&
        userProfile.displayName &&
        hasProfilePhoto &&
        userProfile.departmentId &&
        userProfile.roleId &&
        userProfile.currentShipId;

    // Check if onboarding is marked as complete
    const isOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

    // Check if this is a new user who needs onboarding
    const needsOnboarding = !isAdmin && (!userProfile || !isProfileComplete) && !isOnboardingComplete;

    // Debug logging
    console.log('OnboardingGuard Debug:', {
        isAdmin,
        userProfile: userProfile ? 'exists' : 'null',
        displayName: userProfile?.displayName,
        profilePhoto: userProfile?.profilePhoto,
        profile_photo: (userProfile as any)?.profile_photo,
        hasProfilePhoto,
        departmentId: userProfile?.departmentId,
        roleId: userProfile?.roleId,
        currentShipId: userProfile?.currentShipId,
        isProfileComplete,
        isOnboardingComplete,
        needsOnboarding,
        currentPath: location.pathname
    });

    useEffect(() => {
        // Don't redirect while loading
        if (loading) return;

        // If user is not authenticated, let AuthGuard handle it
        if (!currentUser) return;

        // Skip ALL onboarding logic for admin users - don't even run the effect
        if (isAdmin) {
            console.log('OnboardingGuard: Admin user detected, skipping ALL onboarding logic');
            return;
        }

        // Check if AssignmentForm is open - if so, don't redirect
        const assignmentFormOpen = localStorage.getItem('assignmentFormOpen') === 'true';
        if (assignmentFormOpen) {
            return;
        }

        // If user needs onboarding and not already on onboarding page
        if (needsOnboarding && location.pathname !== '/onboarding') {
            navigate('/onboarding', {
                replace: true,
                state: { from: location.pathname }
            });
        }
    }, [currentUser, isAdmin, needsOnboarding, loading, location.pathname, navigate]);

    // Show loading while checking authentication
    if (loading) {
        return <LoadingPage message="Loading..." showLogo={true} />;
    }

    // If not authenticated, let AuthGuard handle it
    if (!currentUser) {
        return <>{children}</>;
    }

    // Skip all onboarding logic for admin users - just pass through
    if (isAdmin) {
        return <>{children}</>;
    }

    // Allow access for all authenticated users
    return <>{children}</>;
};