import { Button } from '@aerogel/core';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import SectionTitle from './SectionTitle.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    level: number;
    loading: boolean;
    menu: boolean;
    actions: boolean;
};

const meta: Meta<StoryArgs> = {
    title: 'Atoms/SectionTitle',
    component: SectionTitle,
    argTypes: {
        level: { control: { type: 'select' }, options: [1, 2, 3] },
    },
    args: { level: 2, loading: false, menu: false, actions: false },
    render: (args) => (
        <SectionTitle
            level={args.level}
            loading={args.loading}
            menu={args.menu ? [{ label: 'Synchronize all', click: () => {} }] : undefined}
        >
            {{
                default: () => 'Movies (18)',
                actions: args.actions ? () => <Button variant="secondary">Create list</Button> : undefined,
            }}
        </SectionTitle>
    ),
};

export const Default: Story = {};

export const PageTitle: Story = { args: { level: 1, menu: true, actions: true } };

export const Loading: Story = { args: { level: 1, menu: true, loading: true } };

export const Subsection: Story = { args: { level: 3 } };

export default meta;
