import { baseApi, TAG_TYPES } from 'shared/api/baseApi';
import { LabsResponse, LabTemplate } from '../model/types/labs';

export const labsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLabs: builder.query<LabsResponse, { page: number; perPage: number; search?: string }>({
            query: (params) => ({
                url: '/lab-templates',
                params: {
                    page: params.page,
                    perPage: params.perPage,
                    search: params.search || undefined,
                },
            }),
            providesTags: [TAG_TYPES.LAB],
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const total = data.meta?.total || 0;
                    const totalPages = Math.ceil(total / args.perPage);
                    const { paginationActions } = await import('features/pagination/model/slice/paginationSlice');
                    dispatch(paginationActions.setTotalPages(totalPages));
                } catch (error) {
                    console.error('Failed to fetch labs or update pagination:', error);
                }
            },
        }),

        getLabById: builder.query<LabTemplate, string>({
            query: (id) => `/lab-templates/${id}`,
            providesTags: (result, error, id) => [{ type: TAG_TYPES.LAB, id }],
        }),
    }),
});

export const {
    useGetLabsQuery,
    useGetLabByIdQuery,
} = labsApi;
