import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { baseApi } from 'shared/api/baseApi';
import { userActions } from 'entities/user/model/slice/userSlice';
import { useLogoutUserMutation } from '../api/authApi';

export const useLogout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logoutUserMutation, { isLoading }] = useLogoutUserMutation();

    const logout = async () => {
        try {
            // Очищаем локальное хранилище и стейт сразу, чтобы UI отреагировал мгновенно
            localStorage.removeItem('accessToken');
            dispatch(userActions.logout());
            
            // Очищаем кэш RTK Query
            dispatch(baseApi.util.resetApiState());
            
            // Отправляем запрос на сервер, если он упадет - не страшно, локально мы уже вышли
            await logoutUserMutation().unwrap();
        } catch (error) {
            console.error('Backend logout failed, but local state is cleared', error);
        } finally {
            navigate('/login', { replace: true });
        }
    };

    return {
        logout,
        isLoading,
    };
};
