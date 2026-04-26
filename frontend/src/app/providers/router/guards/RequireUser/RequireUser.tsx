import { useGetMeQuery } from 'entities/user/api/userApi';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';

interface RequireUserProps {
    /** Если true — доступ только при `user.role === true` (флаг админа/преподавателя в API). */
    requireAdmin?: boolean;
}

const RequireUser = ({ requireAdmin }: RequireUserProps) => {
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

    if (requireAdmin && user.role !== true) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RequireUser;
