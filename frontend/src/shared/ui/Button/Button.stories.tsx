import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { fn } from 'storybook/test';
import { Button } from './Button';
import { ThemeButton } from './ThemeButton';

const meta = {
    title: 'shared/ui/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Clear: Story = {
    args: {
        children: 'Text',
        theme: ThemeButton.CLEAR,
    },
};

export const Play: Story = {
    args: {
        children: 'Text',
        theme: ThemeButton.PLAY,
    },
};

export const Close: Story = {
    args: {
        children: 'Text',
        theme: ThemeButton.CLOSE,
    },
};

export const Team_btn: Story = {
    args: {
        children: 'Text',
        theme: ThemeButton.TEAM_BTN,
    },
};

export const Outline: Story = {
    args: {
        children: 'Text',
        theme: ThemeButton.OUTLINE,
    },
};

export const Visit: Story = {
    args: {
        children: 'Text',
        theme: ThemeButton.VISIT,
    },
};


export const Pagin_page: Story = {
    args: {
        children: 'Text',
        theme: ThemeButton.PAGIN_PAGE,
    },
};

export const Pagin_arrow: Story = {
    args: {
        children: 'Text',
        theme: ThemeButton.PAGIN_ARROW,
    },
};

export const Inline: Story = {
    args: {
        children: 'Text',
        theme: ThemeButton.INLINE,
    },
};
    // CLEAR = 'clear',
    // CLOSE = 'close',
    // PLAY = 'play',
    // TEAM_BTN = 'team_btn',
    // OUTLINE = 'outline',
    // VISIT = 'visit',
    // PAGIN_PAGE = 'pagin_page',
    // PAGIN_ARROW = 'pagin_arrow',
    // INLINE = 'inline',