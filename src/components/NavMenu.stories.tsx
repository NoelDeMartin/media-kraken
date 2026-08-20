import type { Meta, StoryObj } from '@storybook/vue3-vite';

import NavMenu from './NavMenu.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    label?: string;
    sections?: { label: string; route: string }[];
    startOpen?: boolean;
    selectedIndex?: number;
};

const meta: Meta<StoryArgs> = {
    title: 'NavMenu',
    component: NavMenu,
    argTypes: {
        startOpen: { control: 'boolean' },
        selectedIndex: { control: 'number' },
    },
    args: {
        startOpen: false,
    },
    render: (args) => (
        <div style={{ height: '100px' }}>
            <NavMenu
                startOpen={args.startOpen}
                selectedIndex={args.selectedIndex}
                label={args.label ?? 'My Collection'}
                sections={
                    args.sections ?? [
                        { label: 'My Movies', route: 'movies.index' },
                        { label: 'My Shows', route: 'shows.index' },
                        { label: 'My Lists', route: 'lists.index' },
                    ]
                }
            />
        </div>
    ),
};

export const Default: Story = {};
export const DefaultOpen: Story = { args: { startOpen: true } };
export const Selected: Story = { args: { selectedIndex: 1 } };
export const SelectedOpen: Story = { args: { startOpen: true, selectedIndex: 1 } };

export default meta;
