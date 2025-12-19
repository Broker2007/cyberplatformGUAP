import { StoryObj, Meta } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { createReduxStore } from 'app/providers/StoreProvider/config/store';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
    title: 'features/pagination',
    component: Pagination,
    tags: ['autodocs'],
    decorators: [
        (Story) => {
            const store = createReduxStore({
                pagination: {
                    currentPage: 0,
                    perPage: 1,
                    totalCount: 5,
                    searchQuery: '',
                },
            });
            return (
                <Provider store={store}>
                    <div style={{ width: 600, padding: '20px' }}>
                        <Story />
                    </div>
                </Provider>
            );
        },
    ],
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const InteractivePrimary: Story = {
};
