<template>
    <section>
        <SectionTitle>{{ $t('stats.achievements.title') }}</SectionTitle>
        <p class="text-xs text-gray-600">
            {{
                $t('stats.achievements.unlocked', {
                    unlocked: formatNumber(unlockedAchievements),
                    total: formatNumber(achievements.length),
                })
            }}
        </p>
        <ul class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsAchievementListItem
                v-for="achievement in achievements"
                :key="achievement.achievement.id"
                :progress="achievement"
            />
        </ul>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { formatNumber } from '@/lib/formatting';
import { getAchievementsProgress } from '@/pages/stats/utils/achievements';
import type { StatsSnapshot } from '@/pages/stats/utils/snapshot';

const { snapshot } = defineProps<{ snapshot: StatsSnapshot }>();
const achievements = computed(() => getAchievementsProgress(snapshot));
const unlockedAchievements = computed(() => achievements.value.filter(({ unlocked }) => unlocked).length);
</script>
