import { baseApi, TAG_TYPES } from 'shared/api/baseApi';

export const avatarApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        uploadAvatar: builder.mutation<
            { success: boolean; avatarUrl: string },
            FormData
        >({
            query: (formData) => ({
                url: '/updateavatar',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [TAG_TYPES.USER],
        }),
    }),
});

export const {
    useUploadAvatarMutation,
} = avatarApi;
