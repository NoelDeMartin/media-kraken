<template>
    <article class="group relative isolate border border-slate-200 bg-white shadow-sm">
        <MediaImage :url="show.posterUrl" class="size-full" />
        <ShowCardBadge class="absolute -top-1 -right-3.5 z-10" :show />
        <h2>
            <RouterLink
                :to="{
                    name: 'shows.show',
                    params: { show: show.slug },
                    query: $solid.hasLoggedIn() ? { url: show.url } : undefined,
                }"
                :title="show.name"
                class="focus:ring-primary-500 focus-visible:ring-offset-background absolute inset-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                <div
                    class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span class="sr-only">
                    {{ show.name }}
                    <template v-if="show.watchingStatus === 'watching'">
                        <ShowCardUpcomingEpisodes
                            v-if="show.watchingStatus === 'watching'"
                            :show
                            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-green-600"
                            lang-key="shows.upcomingEpisodes"
                        />
                    </template>
                    <template v-else>
                        ({{
                            show.watchingStatus === 'pending'
                                ? $t('shows.statuses.pending')
                                : show.watchingStatus === 'completed'
                                  ? $t('shows.statuses.completed')
                                  : $t('shows.statuses.dropped')
                        }})
                    </template>
                </span>
            </RouterLink>
        </h2>
    </article>
</template>

<script setup lang="ts">
import Show from '@/models/Show';

defineProps<{ show: Show }>();
</script>
