/**
 * Задаётся в webpack (DefinePlugin) из переменной окружения API_BASE_URL.
 * По умолчанию — продакшен API. Локальный mock: API_BASE_URL=http://localhost:8080 npm start
 */
export const API_BASE_URL: string = __API_BASE_URL__;
