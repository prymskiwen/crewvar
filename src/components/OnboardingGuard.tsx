import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContextFirebase";
import { getUserProfile } from "../firebase/firestore";

interface OnboardingGuardProps {
    children: React.ReactNode;
}

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const { currentUser, loading: authLoading } = useAuth();

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (currentUser && !authLoading) {
                setProfileLoading(true);
                try {
                    const profile = await getUserProfile(currentUser.uid);
                    setUserProfile(profile);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                } finally {
                    setProfileLoading(false);
                    setIsLoading(false);
                }
            } else if (!authLoading) {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [currentUser, authLoading]);

    // Check if user is admin (from user profile, not Firebase user)
    const isAdmin = userProfile?.isAdmin === true;

    // Check if user profile is complete based on actual data
    const isProfileComplete = userProfile &&
        userProfile.display_name &&
        userProfile.profile_photo &&
        userProfile.department_id &&
        userProfile.role_id &&
        userProfile.current_ship_id;

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

        // If authenticated, check email verification first
        if (currentUser && !isPublicRoute) {
            // Wait for profile to load before checking verification status
            if (profileLoading) {
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

            // ADMIN LOGIC: Skip onboarding entirely and redirect to admin page
            if (isAdmin) {
                console.log('Admin user detected, redirecting to admin page');
                // Always redirect admins to admin page, regardless of current route
                navigate('/admin', {
                    replace: true,
                    state: {
                        from: location.pathname,
                        reason: 'Admin users must use admin interface'
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
    }, [isLoading, authLoading, profileLoading, currentUser, isPublicRoute, isEmailVerified, isProfileComplete, isOnboardingComplete, isNewUser, userProfile, navigate, location.pathname, isAdmin]);

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[#069B93] font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Show loading while checking profile status
    if (currentUser && !isPublicRoute && profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[#069B93] font-medium">Checking your profile...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};