import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { WithHeaderLayout } from 'shared/layouts/WithHeaderLayout/WithHeaderLayout';
import { WithoutHeaderLayout } from 'shared/layouts/WithHeaderLayout/WithoutHeaderLayout/WithoutHeaderLayout';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';
import RequireUser from '../guards/RequireUser/RequireUser';

const AppRouter = () => {
    const routes = Object.entries(routeConfig).filter(([, config]) => !config.hidden);

    const publicWithoutHeader = routes.filter(
        ([, config]) => config.layout === 'without-header' && !config.isPrivate,
    );

    const publicWithHeader = routes.filter(
        ([, config]) => config.layout === 'with-header' && !config.isPrivate,
    );

    const privateWithHeader = routes.filter(
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
                    {Object.entries(routeConfig)
                        .filter(
                            ([, c]) => c.hidden
                                && c.layout === 'with-header'
                                && c.isPrivate
                                && !c.allowedRoles,
                        )
                        .map(([key, c]) => (
                            <Route
                                key={`hidden-${key}`}
                                path={c.path}
                                element={<Navigate to="/" replace />}
                            />
                        ))}

                </Route>

                {/* Роуты только для администраторов (см. requireAdmin в RequireUser). */}
                <Route element={<RequireUser requireAdmin />}>
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
