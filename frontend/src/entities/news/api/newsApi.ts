import { baseApi, TAG_TYPES } from 'shared/api/baseApi';

export interface INewsImage {
    url: string;
}

export interface INews {
    id: string;
    title: string;
    content: string;
    images: INewsImage[];
    createdAt:string;
}

export interface PublicationsResponse {
    items: INews[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export const newsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // 🔥 GET
        getNews: builder.query<
            PublicationsResponse,
            { page: number; perPage: number; scope?: string }
        >({
            query: ({ page, perPage }) => ({
                url: '/news/publications',
                params: {
                    page,
                    page_size: perPage,
                },
            }),

            providesTags: [TAG_TYPES.NEWS],

            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;

                    const { paginationActions } = await import(
                        'features/pagination/model/slice/paginationSlice'
                    );

                    const pageSize = data.page_size || args.perPage || 1;

                    const total = Math.ceil(
                        (data.total ?? 0) / Math.max(1, pageSize),
                    );

                    dispatch(
                        paginationActions.setTotalPages({
                            total,
                            scope: args.scope || 'news',
                        }),
                    );

                    dispatch(
                        paginationActions.setPerPage({
                            perPage: data.page_size,
                            scope: args.scope || 'news',
                        }),
                    );
                } catch (e) {
                    console.error(e);
                }
            },
        }),

        createNews: builder.mutation<
            INews,
            { title: string; content: string }
        >({
            query: (body) => ({
                url: '/news/publications',
                method: 'POST',
                body,
            }),
            invalidatesTags: [TAG_TYPES.NEWS],
        }),

        // 🔥 UPLOAD IMAGES К ПУБЛИКАЦИИ
        uploadImages: builder.mutation<
            void,
            { id: string; files: File[] }
        >({
            query: ({ id, files }) => {
                const formData = new FormData();

                files.forEach((file) => {
                    formData.append('images', file);
                });

                return {
                    url: `/news/publications/${id}/images`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: [TAG_TYPES.NEWS],
        }),

        // 🔥 DELETE
        deleteNews: builder.mutation<void, string>({
            query: (id) => ({
                url: `/news/publications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [TAG_TYPES.NEWS],
        }),

    }),
});

export const {
    useGetNewsQuery,
    useCreateNewsMutation,
    useUploadImagesMutation,
    useDeleteNewsMutation,
} = newsApi;
