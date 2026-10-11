<template>
    <div
        class="rounded-card flex items-start gap-3 p-4"
        :class="progress.unlocked ? 'bg-white shadow-sm' : 'bg-gray-200/50'"
    >
        <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full"
            :class="progress.unlocked ? 'bg-primary-100 text-primary-700' : 'bg-gray-300 text-gray-600'"
        >
            <component :is="progress.achievement.icon" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
            <p class="font-semibold" :class="progress.unlocked ? 'text-gray-900' : 'text-gray-700'">
                {{ $t(`insights.achievements.${progress.achievement.id}.title`) }}
                <span v-if="!progress.unlocked" class="sr-only">({{ $t('insights.achievements.locked') }})</span>
            </p>
            <p class="text-sm text-gray-600">
                {{
                    $t(`insights.achievements.${progress.achievement.id}.description`, {
                        target: formatNumber(progress.achievement.target),
                    })
                }}
            </p>
            <div v-if="!progress.unlocked && progress.achievement.target > 1" class="mt-2 flex items-center gap-2">
                <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-300">
                    <div
                        class="h-full rounded-full bg-gray-600"
                        :style="{ width: `${(progress.value / progress.achievement.target) * 100}%` }"
                    />
                </div>
                <span class="text-xs text-gray-600 tabular-nums">
                    {{ formatNumber(progress.value) }} / {{ formatNumber(progress.achievement.target) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatNumber } from '@/lib/formatting';
import type { AchievementProgress } from '@/lib/gamification';

defineProps<{ progress: AchievementProgress }>();
</script>
