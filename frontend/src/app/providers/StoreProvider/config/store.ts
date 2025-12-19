import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { userApi, userReducer } from 'entities/user';
import { authApi } from 'features/auth';
import { paginationReducer } from 'features/pagination';

export const rootReducer = combineReducers({
    pagination: paginationReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    user: userReducer,
    // другие редьюсеры
});
export function createReduxStore(
    // @ts-ignore
    // исправиться как продумается авторизация
    initialState,
) {
    const store = configureStore({
        reducer: rootReducer,
        preloadedState: initialState,
        devTools: __IS_DEV__,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(userApi.middleware),
    });
    return store;
}
export type RootState = ReturnType<typeof createReduxStore>['getState'];
export type AppDispatch = ReturnType<typeof createReduxStore>['dispatch']
