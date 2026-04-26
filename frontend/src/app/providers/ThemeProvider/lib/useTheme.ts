import { useContext } from 'react';
import { LOCAL_STORAGE_THEME_KEY, Theme, ThemeContext } from './ThemeContext';

interface UseThemeResult {
    toggleTheme: () => void;
    theme: Theme;
}

export function useTheme(): UseThemeResult {
    const { theme, setTheme } = useContext(ThemeContext);

    // Проверяем, что контекст существует
    if (!setTheme) {
        throw new Error('useTheme undefined');
    }

    const toggleTheme = () => {
        const newTheme = theme === Theme.RED ? Theme.BLUE : Theme.RED;
        setTheme(newTheme);
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
    };

    return {
        theme: theme || Theme.BLUE,
        toggleTheme,
    };
}
