import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContextFirebase';
import { LoadingPage } from '../components/ui';

interface AdminGuardProps {
    children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, userProfile, loading } = useAuth();

    // Check if user is admin from user profile
    const isAdmin = userProfile?.isAdmin === true;

    useEffect(() => {
        // Don't redirect while loading
        if (loading) return;

        // If user is not authenticated, let AuthGuard handle it
        if (!currentUser) return;

        // If user is admin, ensure they're on admin routes
        if (isAdmin) {
            const isAdminRoute = location.pathname.startsWith('/admin');

            if (!isAdminRoute) {
                console.log('AdminGuard: Redirecting admin user from', location.pathname, 'to /admin');
                navigate('/admin', {
                    replace: true,
                    state: {
                        from: location.pathname,
                        reason: 'Admin users can only access admin pages'
                    }
                });
            }
        }
    }, [currentUser, isAdmin, loading, location.pathname, navigate]);

    // If admin user and not on admin route, show loading while redirecting
    if (currentUser && isAdmin && !location.pathname.startsWith('/admin')) {
        return <LoadingPage message="Redirecting to admin..." showLogo={true} />;
    }

    // Show loading while checking authentication
    if (loading) {
        return <LoadingPage message="Loading..." showLogo={true} />;
    }

    // If not authenticated, let AuthGuard handle it
    if (!currentUser) {
        return <>{children}</>;
    }

    // If admin user, allow access (they'll be redirected to admin routes)
    if (isAdmin) {
        return <>{children}</>;
    }

    // Regular user, allow access
    return <>{children}</>;
};
