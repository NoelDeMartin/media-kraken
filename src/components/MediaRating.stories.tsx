import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import MediaRating from './MediaRating.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    rating: number | null;
    readonly: boolean;
    size: 'sm' | 'md';
};

const meta: Meta<StoryArgs> = {
    title: 'Atoms/MediaRating',
    component: MediaRating,
    argTypes: {
        rating: { control: { type: 'number', min: 0, max: 10, step: 1 } },
        readonly: { control: 'boolean' },
    },
    args: {
        rating: null,
        readonly: false,
    },
    render(args) {
        const rating = ref(args.rating);

        return () => (
            <div class="flex flex-col items-start gap-2">
                <MediaRating
                    modelValue={rating.value}
                    readonly={args.readonly}
                    size={args.size}
                    onUpdate:modelValue={(value: number | null) => (rating.value = value)}
                />
                <span class="text-sm text-gray-600">Saved rating: {rating.value ?? 'none'}</span>
            </div>
        );
    },
};

export const Empty: Story = {};
export const Rated: Story = { args: { rating: 7 } };
export const Zero: Story = { args: { rating: 0 } };
export const Full: Story = { args: { rating: 10 } };
export const ReadonlySmall: Story = { args: { rating: 7, readonly: true, size: 'sm' } };

export default meta;
