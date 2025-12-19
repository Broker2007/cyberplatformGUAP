import { MainPage } from 'pages/MainPage';
import { PagesErrors } from 'pages/PagesErrors';
import { GroupsPage } from 'pages/GroupsPage';
import { LoginPage } from 'pages/LoginPage';
import { RegPage } from 'pages/RegPage';
import { ProfilePage } from 'pages/ProfilePage';
import { ReactElement } from 'react';
import { LabTemplatePage } from 'pages/LabTemplate';
import { LabTemplatesPage } from 'pages/LabTemplates';
import { AdminPage } from 'pages/AdminPage';

export enum AppRoutes {
    MAIN = 'main',
    GROUPS = 'groups',
    LOGIN = 'login',
    REGISTER = 'register',
    PROFILE = 'profile',
    LAB_TEMPLATES = 'lab_templates',
    LAB_TEMPLATE = 'lab_template',
    ADMIN = 'admin',
    NOT_FOUND = 'not_found',
}

export const RoutePath: Record<AppRoutes, string> = {
    [AppRoutes.MAIN]: '/',
    [AppRoutes.GROUPS]: '/groups',
    [AppRoutes.LOGIN]: '/login',
    [AppRoutes.REGISTER]: '/register',
    [AppRoutes.PROFILE]: '/profile',
    [AppRoutes.LAB_TEMPLATES]: '/labs_templates',
    [AppRoutes.LAB_TEMPLATE]: '/labs_templates/:id',
    [AppRoutes.ADMIN]: '/admin',
    [AppRoutes.NOT_FOUND]: '*',
};

export interface AppRouteProps {
    element: ReactElement;
    path: string;
    layout: 'with-header' | 'without-header';
    isPrivate?: boolean;
    allowedRoles?: boolean;
}

export const routeConfig: Record<AppRoutes, AppRouteProps> = {
    [AppRoutes.MAIN]: {
        path: RoutePath.main,
        element: <MainPage />,
        layout: 'without-header',
    },
    [AppRoutes.GROUPS]: {
        path: RoutePath.groups,
        element: <GroupsPage />,
        layout: 'with-header',
        isPrivate: true,
    },
    [AppRoutes.LOGIN]: {
        path: RoutePath.login,
        element: <LoginPage />,
        layout: 'without-header',
    },
    [AppRoutes.REGISTER]: {
        path: RoutePath.register,
        element: <RegPage />,
        layout: 'without-header',
    },
    [AppRoutes.PROFILE]: {
        path: RoutePath.profile,
        element: <ProfilePage />,
        layout: 'with-header',
        isPrivate: true,
    },
    [AppRoutes.LAB_TEMPLATES]: {
        path: RoutePath.lab_templates,
        element: <LabTemplatesPage />,
        layout: 'with-header',
        isPrivate: true,
    },
    [AppRoutes.LAB_TEMPLATE]: {
        path: RoutePath.lab_template,
        element: <LabTemplatePage />,
        layout: 'with-header',
        isPrivate: true,
    },
    [AppRoutes.ADMIN]: {
        path: RoutePath.admin,
        element: <AdminPage />,
        layout: 'with-header',
        isPrivate: true,
        allowedRoles: true,
    },

    [AppRoutes.NOT_FOUND]: {
        path: RoutePath.not_found,
        // eslint-disable-next-line max-len
        element: <PagesErrors title="Страница не найдена" text="Похоже мы не смогли найти такую страничку" code="404" />,
        layout: 'without-header',
    },
};
