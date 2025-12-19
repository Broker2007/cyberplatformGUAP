import type { Meta, StoryObj} from '@storybook/react-webpack5';
import { Loader } from './Loader';

const meta: Meta<typeof Loader> = {
    title: 'shared/ui/Loader',
    component: Loader,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj<typeof Loader>

export const Primary: Story = {};