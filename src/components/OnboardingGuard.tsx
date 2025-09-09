import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOnboardingGuard } from "../context/OnboardingGuardContext";
import { useAuth } from "../context/AuthContext";

interface OnboardingGuardProps {
    children: React.ReactNode;
}

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { 
        onboardingStatus, 
        isOnboardingComplete, 
        isOnboardingRequired, 
        missingRequirements,
        checkOnboardingStatus 
    } = useOnboardingGuard();

    // Routes that don't require onboarding completion
    const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/signup',
        '/onboarding'
    ];

    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
    );

    useEffect(() => {
        const checkOnboarding = async () => {
            if (!currentUser) return; // No user logged in
            
            try {
                await checkOnboardingStatus(currentUser.uid);
            } catch (error) {
                console.error('Failed to check onboarding status:', error);
            }
        };

        checkOnboarding();
    }, [currentUser, checkOnboardingStatus]);

    // Redirect logic
    useEffect(() => {
        if (!currentUser) return; // No user logged in
        if (isPublicRoute) return; // Public route, no redirect needed
        if (isOnboardingComplete) return; // Onboarding complete, no redirect needed

        // User is logged in, not on public route, and onboarding is required
        if (isOnboardingRequired) {
            console.log('Redirecting to onboarding - missing requirements:', missingRequirements);
            navigate('/onboarding', { 
                replace: true,
                state: { 
                    from: location.pathname,
                    missingRequirements 
                }
            });
        }
    }, [currentUser, isPublicRoute, isOnboardingComplete, isOnboardingRequired, missingRequirements, navigate, location.pathname]);

    // Show loading state while checking onboarding status
    if (currentUser && !onboardingStatus) {
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
