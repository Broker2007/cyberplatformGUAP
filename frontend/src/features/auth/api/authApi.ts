import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RegisterInput, RegisterPayload } from 'pages/RegPage/ui/RegPage';
import { LoginInput } from 'pages/LoginPage/ui/LoginPage';
import { baseQueryWithReauth } from 'shared/api/baseQueryWithRefresh';
import { userActions } from 'entities/user';
import { ILoginResponse, IRegisterResponse } from '../model/types/types';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        registerUser: builder.mutation<IRegisterResponse, RegisterPayload>({
            query: (data) => ({
                url: '/auth/SignUp',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    console.log('пользователь авторизован');
                } catch (error) {
                    console.error('Registration failed:', error);
                }
            },
            invalidatesTags: ['Auth'],
        }),

        loginUser: builder.mutation<ILoginResponse, LoginInput>({
            query: (data) => ({
                url: '/auth/SignIn', // SingUp
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    localStorage.setItem('accessToken', data.token);
                } catch (error) {
                    console.error('Login failed:', error);
                }
            },
            invalidatesTags: ['Auth'],
        }),
        logoutUser: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
                credentials: 'include',
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    localStorage.removeItem('accessToken');
                    dispatch(userActions.logout());
                } catch (error) {
                    console.error('Server logout failed, cleaning client side:', error);
                    localStorage.removeItem('accessToken');
                    dispatch(userActions.logout());
                }
            },
            invalidatesTags: ['Auth'],
        }),
    }),
});
export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
} = authApi;
