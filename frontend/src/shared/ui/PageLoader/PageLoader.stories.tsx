import { Meta, StoryObj } from '@storybook/react-webpack5';
import { PageLoader } from './PageLoader';

const meta: Meta<typeof PageLoader> = {
    title: 'shared/ui/PageLoader',
    component: PageLoader,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj<typeof PageLoader>;

export const Primary: Story = {};
