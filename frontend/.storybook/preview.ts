import type { Preview } from '@storybook/react-webpack5';
import { BrowserRouter } from 'react-router-dom';
import "app/styles/index.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;