import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from 'shared/api/baseQueryWithRefresh';

export const TAG_TYPES = {
    LAB: 'LabTemplates',
    USER: 'User',
} as const;

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: [TAG_TYPES.LAB, TAG_TYPES.USER],
    endpoints: () => ({}),
});
