<template>
    <Page>
        <article class="flex flex-row gap-6">
            <MoviePoster :movie class="aspect-2/3 w-64 shrink-0 rounded shadow" />
            <div class="flex flex-1 flex-col">
                <div class="flex items-center justify-between gap-2">
                    <h1 class="text-2xl font-semibold text-gray-900">
                        {{ movie.title }}
                        <span v-if="movie.releaseYear" class="text-lg font-medium"> ({{ movie.releaseYear }}) </span>
                    </h1>
                    <DropdownMenu
                        align="end"
                        :options="[
                            movie.watched
                                ? {
                                      label: $t('movies.watchLater'),
                                      async click() {
                                          await movie.unwatch();
                                      },
                                  }
                                : {
                                      label: $t('movies.watch'),
                                      async click() {
                                          await movie.watch();
                                      },
                                  },
                        ]"
                    >
                        <Button
                            size="icon"
                            variant="ghost"
                            :aria-label="$t('movies.openActionsMenu')"
                            :title="$t('movies.openActionsMenu')"
                        >
                            <i-mdi-dots-vertical class="size-5" />
                        </Button>
                    </DropdownMenu>
                </div>
                <div
                    class="flex items-center gap-1 text-sm lowercase"
                    :class="{
                        'text-green-700': movie.watched,
                        'text-blue-700': !movie.watched,
                    }"
                >
                    <i-material-symbols-check v-if="movie.watched" class="size-4" />
                    <i-mdi-clock-outline v-else class="size-4" />
                    <span>{{ movie.watched ? $t('movies.watched') : $t('movies.watchLater') }}</span>
                </div>
                <p v-if="movie.description" class="mt-2 leading-relaxed text-gray-700">
                    {{ movie.description }}
                </p>
            </div>
        </article>
    </Page>
</template>

<script setup lang="ts">
import Movie from '@/models/Movie';

defineProps<{ movie: Movie }>();
</script>
