import { Theme, ThemeProvider } from 'app/providers/ThemeProvider';
import '../../../../app/styles/index.scss';
import { JSX } from 'react/jsx-runtime';
import React from 'react';

// 2. Типизируйте параметры функции с помощью StoryContext
export const StyleDecorator = (theme: Theme) => (Story: React.ComponentType): JSX.Element => (
    <ThemeProvider initialTheme={theme}>
        <div className={`app ${theme}`}>
            <Story />
        </div>
    </ThemeProvider>
);
