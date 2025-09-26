import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContextFirebase";

export const ProtectedRoute = () => {
    const { currentUser } = useAuth();
    const location = useLocation();

    return currentUser ? (
        <Outlet />
    ) : (
        <Navigate to="/auth/login" state={{ from: location }} replace />
    );
};
