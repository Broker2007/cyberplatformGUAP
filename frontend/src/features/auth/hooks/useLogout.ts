import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { baseApi } from 'shared/api/baseApi';
import { userActions } from 'entities/user';
import { useLogoutUserMutation } from '../api/authApi';

export const useLogout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logoutUser, { isLoading }] = useLogoutUserMutation();

    const logout = async () => {
        try {
            dispatch(baseApi.util.resetApiState());
            localStorage.removeItem('accessToken');
            dispatch(userActions.logout());
            logoutUser().unwrap().catch(() => {
            });
        } catch (error) {
            console.log('Logout completed');
        } finally {
            navigate('/', { replace: true });
        }
    };

    return {
        logout,
        isLoading,
    };
};
