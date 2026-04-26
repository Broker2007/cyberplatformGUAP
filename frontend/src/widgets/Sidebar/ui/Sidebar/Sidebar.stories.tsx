import type { StoryObj, Meta } from '@storybook/react-webpack5';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
    title: 'shared/widgets/sidebar',
    component: Sidebar,
    tags: ['autodocs'],
    parameters: {
        layout: 'left',
        docs:{
            story:{
                height:'600px',
            },
        },
    },
    decorators: [
        (Story) => (
            <MemoryRouter>

                <Story />

            </MemoryRouter>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Primary: Story = {};
