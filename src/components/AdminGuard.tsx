import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContextFirebase';

interface AdminGuardProps {
    children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, userProfile, loading } = useAuth();

    useEffect(() => {
        // Don't redirect while loading
        if (loading) return;

        // If user is not authenticated, let other guards handle it
        if (!currentUser) return;

        // If user is admin, they should only access admin routes
        if (userProfile?.isAdmin) {
            const isAdminRoute = location.pathname.startsWith('/admin');

            if (!isAdminRoute) {
                navigate('/admin', {
                    replace: true,
                    state: {
                        from: location.pathname,
                        reason: 'Admin users can only access admin pages'
                    }
                });
            }
        }
    }, [currentUser, userProfile, loading, location.pathname, navigate]);

    return <>{children}</>;
};
