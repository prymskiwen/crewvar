import { useAuth } from '../context/AuthContextFirebase';
import { AdminGuard } from './AdminGuard';
import { OnboardingGuard } from './OnboardingGuard';
import { LoadingPage } from '../components/ui';

export const ConditionalGuards = ({ children }: { children: React.ReactNode }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return <LoadingPage message="Loading..." showLogo={true} />;
    }
    if (!currentUser) {
        return <>{children}</>;
    }

    // Wait for userProfile to load before making routing decisions
    if (!userProfile) {
        return <LoadingPage message="Loading user profile..." showLogo={true} />;
    }

    // Check admin status from user profile
    const isAdmin = userProfile.isAdmin === true;

    if (isAdmin) {
        return (
            <AdminGuard>
                {children}
            </AdminGuard>
        );
    }

    return (
        <OnboardingGuard>
            {children}
        </OnboardingGuard>
    );
};
