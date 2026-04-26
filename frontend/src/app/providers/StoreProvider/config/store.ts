import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { userReducer } from 'entities/user';
import { authApi } from 'features/auth';
import { paginationReducer } from 'features/pagination';
import { baseApi } from 'shared/api/baseApi';

export const rootReducer = combineReducers({
    pagination: paginationReducer,
    user: userReducer,

    [authApi.reducerPath]: authApi.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createReduxStore(initialState?: Partial<RootState>) {
    const store = configureStore({
        reducer: rootReducer,
        preloadedState: initialState,
        devTools: __IS_DEV__,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(baseApi.middleware), // 🔥
    });

    return store;
}

export type AppDispatch = ReturnType<typeof createReduxStore>['dispatch'];
