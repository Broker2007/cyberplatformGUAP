import { baseApi, TAG_TYPES } from 'shared/api/baseApi';
import { IUser } from '../model/types/UserSchema';

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query<IUser, void>({
            query: () => '/auth/me',
            providesTags: [TAG_TYPES.USER],
        }),

    }),
});

export const {
    useGetMeQuery,
} = userApi;
