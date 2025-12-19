import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { MemoryRouter } from 'react-router-dom';
import LabItem from './LabItem';

const meta: Meta<typeof LabItem> = {
    title: 'shared/ui/LabItem',
    component: LabItem,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MemoryRouter>
                {' '}
                <Story />
                {' '}
            </MemoryRouter>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof LabItem>;

export const Primary: Story = {
    args: {
        id: '1',
        title: 'Лабораторная работа номер 1',
        difficulty: 'medium',
        status: 'Решена',
        tags: ['tools', 'snmp', 'network'],
        description: {
            overview: 'Пример описания лабы 1',
            objectives: ['obj1', 'obj 2'],
            resources: [
                { title: 'res1', url: 'https://google.com' },
            ],
        },
    },
};
