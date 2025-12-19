import type { Meta, StoryObj } from '@storybook/react-webpack5';
import Input from './Input';

const meta: Meta<typeof Input> = {
    title: 'shared/ui/Input',
    component: Input,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Primary: Story = {
    args: {
        placeholder: 'Введите текст',
        value: '',
    },
};

export const WithValue: Story = {
    args: {
        placeholder: 'Введите текст',
        value: 'Пример текста',
    },
};

export const Password: Story = {
    args: {
        placeholder: 'Пароль',
        type: 'password',
        value: '',
    },
};
