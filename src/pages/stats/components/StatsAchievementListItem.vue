<template>
    <li
        class="rounded-card flex items-start gap-3 p-4"
        :title="progress.details ?? undefined"
        :class="progress.unlocked ? 'bg-surface shadow-sm' : 'bg-gray-200/50 dark:bg-white/5'"
    >
        <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full"
            :class="
                progress.unlocked
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-300 text-gray-600 dark:bg-white/10 dark:text-gray-400'
            "
        >
            <component :is="progress.revealed ? progress.achievement.icon : IconSecret" class="size-5" />
        </span>
        <div v-if="progress.revealed" class="min-w-0 flex-1">
            <p
                class="font-semibold"
                :class="progress.unlocked ? 'text-primary-text' : 'text-gray-700 dark:text-gray-300'"
            >
                {{ $t(`stats.achievements.${progress.achievement.id}.title`) }}
                <span v-if="!progress.unlocked" class="sr-only">({{ $t('stats.achievements.locked') }})</span>
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
                {{
                    $t(
                        `stats.achievements.${progress.achievement.id}.${progress.unlocked ? 'completedDescription' : 'description'}`,
                        {
                            target: formatNumber(progress.achievement.target),
                        },
                    )
                }}
            </p>
            <div v-if="!progress.unlocked && progress.achievement.target > 1" class="mt-2 flex items-center gap-2">
                <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-300 dark:bg-white/10">
                    <div
                        class="h-full rounded-full bg-gray-600 dark:bg-gray-400"
                        :style="{ width: `${(progress.value / progress.achievement.target) * 100}%` }"
                    />
                </div>
                <span class="text-xs text-gray-600 tabular-nums dark:text-gray-400">
                    {{ formatNumber(progress.value) }} / {{ formatNumber(progress.achievement.target) }}
                </span>
            </div>
        </div>
        <div v-else class="min-w-0 flex-1">
            <p class="font-semibold text-gray-700 dark:text-gray-300">
                {{ $t('stats.achievements.secret.title', { number: progress.secretNumber }) }}
                <span class="sr-only">({{ $t('stats.achievements.locked') }})</span>
            </p>
            <p class="text-sm text-gray-600 italic dark:text-gray-400">
                {{ $t(`stats.achievements.${progress.achievement.id}.hint`) }}
            </p>
        </div>
    </li>
</template>

<script setup lang="ts">
import IconSecret from '~icons/ph/seal-question-fill';

import { formatNumber } from '@/lib/formatting';
import type { AchievementProgress } from '@/pages/stats/utils/achievements';

defineProps<{ progress: AchievementProgress }>();
</script>
