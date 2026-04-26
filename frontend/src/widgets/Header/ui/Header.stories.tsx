import { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { createReduxStore } from 'app/providers/StoreProvider/config/store';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
    title: 'shared/widgets/Header',
    component: Header,
    tags: ['autodocs'],
    decorators: [
        (Story) => {
            const store = createReduxStore({});
            return (
                <MemoryRouter>
                    <Provider store={store}>
                        <Story />
                    </Provider>
                </MemoryRouter>
            );
        },
    ],
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Primary: Story = {};
