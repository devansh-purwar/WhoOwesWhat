import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const userId = localStorage.getItem('userId');
    const location = useLocation();

    if (!userId) {
        // Redirect to landing page, but save the intended location
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
