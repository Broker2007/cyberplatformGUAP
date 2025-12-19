import { useGetMeQuery } from 'entities/user/api/userApi';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';

interface RequireUserProps {
  allowedRoles?: boolean;
}

const RequireUser = ({ allowedRoles }: RequireUserProps) => {
    const location = useLocation();
    const { data: user, isLoading, isError } = useGetMeQuery();

    if (isLoading) {
        return <PageLoader />;
    }

    if (isError) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (allowedRoles && !allowedRoles === user.role) {
        console.log(`Access denied: User role "${user.role}" not in allowed roles:`, allowedRoles);
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    console.log(`Access granted for role: ${user.role}`);
    return <Outlet />;
};

export default RequireUser;
