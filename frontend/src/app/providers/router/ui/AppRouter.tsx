import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { WithHeaderLayout } from 'shared/layouts/WithHeaderLayout/WithHeaderLayout';
import { WithoutHeaderLayout } from 'shared/layouts/WithHeaderLayout/WithoutHeaderLayout/WithoutHeaderLayout';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';
import RequireUser from '../guards/RequireUser/RequireUser';

const AppRouter = () => {
    const publicWithoutHeader = Object.entries(routeConfig).filter(
        ([, config]) => config.layout === 'without-header' && !config.isPrivate,
    );

    const publicWithHeader = Object.entries(routeConfig).filter(
        ([, config]) => config.layout === 'with-header' && !config.isPrivate,
    );

    const privateWithHeader = Object.entries(routeConfig).filter(
        ([, config]) => config.layout === 'with-header' && config.isPrivate,
    );

    return (
        <Routes>
            {/* Публичные роуты без хедера */}
            <Route element={<WithoutHeaderLayout />}>
                {publicWithoutHeader.map(([key, config]) => (
                    <Route
                        key={key}
                        path={config.path}
                        element={(
                            <Suspense fallback={<PageLoader />}>
                                {config.element}
                            </Suspense>
                        )}
                    />
                ))}
            </Route>

            {/* Публичные роуты с хедером */}
            {publicWithHeader.length > 0 && (
                <Route element={<WithHeaderLayout />}>
                    {publicWithHeader.map(([key, config]) => (
                        <Route
                            key={key}
                            path={config.path}
                            element={(
                                <Suspense fallback={<PageLoader />}>
                                    {config.element}
                                </Suspense>
                            )}
                        />
                    ))}
                </Route>
            )}

            {/* Защищенные роуты с хедером */}
            <Route element={<WithHeaderLayout />}>
                <Route element={<RequireUser />}>
                    {privateWithHeader
                        .filter(([, config]) => config.allowedRoles !== true)
                        .map(([key, config]) => {
                            console.log(config);
                            return (
                                <Route
                                    key={key}
                                    path={config.path}
                                    element={(
                                        <Suspense fallback={<PageLoader />}>
                                            {config.element}
                                        </Suspense>
                                    )}
                                />
                            );
                        })}

                </Route>

                {/* Роуты ТОЛЬКО для админа */}
                <Route element={<RequireUser allowedRoles />}>
                    {/* Динамически генерируем вложенные маршруты */}
                    {privateWithHeader
                        .filter(([, config]) => config.allowedRoles === true)
                        .map(([key, config]) => (
                            <Route
                                key={key}
                                path={config.path}
                                element={(
                                    <Suspense fallback={<PageLoader />}>
                                        {config.element}
                                    </Suspense>
                                )}
                            />
                        ))}
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRouter;
