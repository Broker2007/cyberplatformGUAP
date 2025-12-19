import { RoutePath } from 'shared/config/routeConfig/routeConfig';

export interface SideBarItemType {
    path: string;
    text: string;
}

export const SideBarItemsList: SideBarItemType[] = [
    {
        path: RoutePath.main,
        text: 'Главная',
    },
    {
        path: RoutePath.groups,
        text: 'Группы',
    },
    {
        path: '/labs_templates',
        text: 'Лабараторные',
    },
    {
        path: RoutePath.profile,
        text: 'Профиль',
    },
];
