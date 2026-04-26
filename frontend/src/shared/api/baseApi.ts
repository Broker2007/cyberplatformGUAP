import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from 'shared/api/baseQueryWithRefresh';

export const TAG_TYPES = {
    LAB: 'LabTemplates',
    NEWS: 'News',
    USER: 'User',
    LAB_REPORT: 'LabReport',
    AUDIT: 'Audit',
} as const;

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: [TAG_TYPES.LAB, TAG_TYPES.USER, TAG_TYPES.LAB_REPORT, TAG_TYPES.AUDIT, TAG_TYPES.NEWS],
    endpoints: () => ({}),
});
