import { AppRoutes, routeConfig } from 'shared/config/routeConfig/routeConfig';

export interface SideBarItemType {
    path: string;
    text: string;
}

const SIDEBAR_ORDER: { key: AppRoutes; text: string }[] = [
    { key: AppRoutes.MAIN, text: 'Главная' },
    { key: AppRoutes.GROUPS, text: 'Группы' },
    { key: AppRoutes.LAB_TEMPLATES, text: 'Лабараторные' },
    { key: AppRoutes.PROFILE, text: 'Профиль' },
];

export const SideBarItemsList: SideBarItemType[] = SIDEBAR_ORDER
    .filter(({ key }) => !routeConfig[key].hidden)
    .map(({ key, text }) => ({
        path: routeConfig[key].path,
        text,
    }));
