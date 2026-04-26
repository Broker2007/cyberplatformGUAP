import { useLogout } from 'features/auth/hooks/useLogout';
import { userApi } from './api/userApi';
import { userActions, userReducer } from './model/slice/userSlice';

export {
    userApi, userActions, userReducer, useLogout,
};
