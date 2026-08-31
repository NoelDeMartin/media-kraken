import { arrayRandomItem } from '@noeldemartin/utils';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import movies from '@/lib/stubs/solid-movies';
import Movie from '@/models/Movie';

import MovieCard from './MovieCard.vue';
import VirtualMediaGrid from './VirtualMediaGrid.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'VirtualMediaGrid',
    render() {
        const stubs = Array.from({ length: 3000 }, (_, index) => {
            const movie = new Movie({
                title: `Movie ${index + 1}`,
                posterUrl: arrayRandomItem(movies.all)?.posterUrl,
            });

            movie.mintUrl();

            return movie;
        });

        return (
            <VirtualMediaGrid items={stubs} by="url">
                {{ default: ({ item }: { item: Movie }) => <MovieCard key={item.url} movie={item} /> }}
            </VirtualMediaGrid>
        );
    },
};

export const Primary: Story = {};

export default meta;
