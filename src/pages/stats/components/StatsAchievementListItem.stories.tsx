import { required } from '@noeldemartin/utils';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { getAchievementsProgress, type AchievementProgress } from '@/pages/stats/utils/achievements';
import { getStatsSnapshot } from '@/pages/stats/utils/snapshot';

import StatsAchievementListItem from './StatsAchievementListItem.vue';

type Story = StoryObj<typeof meta>;

const progresses = getAchievementsProgress(getStatsSnapshot([], []));
const regular = required(progresses.find(({ achievement }) => !achievement.secret && achievement.target > 1));
const secret = required(progresses.find(({ achievement }) => achievement.secret));
const STATES: Record<string, AchievementProgress> = {
    Unlocked: { ...regular, value: regular.achievement.target, unlocked: true, revealed: true },
    InProgress: { ...regular, value: Math.round(regular.achievement.target / 3), unlocked: false, revealed: true },
    Secret: { ...secret, unlocked: false, revealed: false, secretNumber: 1 },
    SecretUnlocked: { ...secret, value: 1, unlocked: true, revealed: true, details: 'Unlocked watching Seven Samurai' },
};

function render(progress: AchievementProgress) {
    return () => (
        <ul class="w-80">
            <StatsAchievementListItem progress={progress} />
        </ul>
    );
}

const meta: Meta = {
    title: 'Molecules/StatsAchievementListItem',
    component: StatsAchievementListItem,
};

export const Unlocked: Story = { render: render(STATES.Unlocked!) };

export const InProgress: Story = { render: render(STATES.InProgress!) };

export const Secret: Story = { render: render(STATES.Secret!) };

export const SecretUnlocked: Story = { render: render(STATES.SecretUnlocked!) };

export default meta;
