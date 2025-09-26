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
                console.log('Admin user accessing non-admin route, redirecting to admin page');
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

    // If user is admin and not on admin route, show loading while redirecting
    if (userProfile?.isAdmin && !location.pathname.startsWith('/admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#069B93] mx-auto mb-4"></div>
                    <p className="text-[#069B93] font-medium">Redirecting to admin page...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
