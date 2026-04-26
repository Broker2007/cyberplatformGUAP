import { baseApi, TAG_TYPES } from 'shared/api/baseApi';
import type { AuditResponse } from '../model/types/auditTypes';

export const auditApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Получить все логи аудита
        getAllAuditLogs: builder.query<AuditResponse, void>({
            query: () => '/audit/logs/all',
            providesTags: [TAG_TYPES.AUDIT],
        }),
    }),
});

export const { useGetAllAuditLogsQuery } = auditApi;
