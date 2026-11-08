import type { Meta, StoryObj } from '@storybook/vue3-vite';

import movies from '@/lib/fixtures/tmdb/movies.json';
import Person from '@/models/Person';

import PersonCard from './PersonCard.vue';

type Story = StoryObj<typeof meta>;

const cast = movies[0]?.credits?.cast ?? [];

const meta: Meta = {
    title: 'Molecules/PersonCard',
    component: PersonCard,
};

export const Default: Story = {
    render: () => (
        <div class="w-32">
            <PersonCard person={Person.fromTMDB(cast[0]!)} characters={['Elisabeth']} />
        </div>
    ),
};

export const WithoutImage: Story = {
    render: () => (
        <div class="w-32">
            <PersonCard person={new Person({ name: 'Unknown Actor' })} />
        </div>
    ),
};

export const MultipleCharacters: Story = {
    render: () => (
        <div class="w-32">
            <PersonCard
                person={new Person({ name: 'Kyle MacLachlan' })}
                characters={['Dale Cooper', 'Dougie Jones', 'Mr. C']}
            />
        </div>
    ),
};

export const Grid: Story = {
    render: () => (
        <ul class="grid max-w-3xl grid-cols-6 gap-4">
            {cast.map((person) => (
                <li key={person.id}>
                    <PersonCard
                        person={Person.fromTMDB(person)}
                        characters={person.character ? person.character.split(' / ') : []}
                    />
                </li>
            ))}
        </ul>
    ),
};

export default meta;
