<template>
    <article class="group relative isolate border border-slate-200 bg-white shadow-sm">
        <!-- TODO focus ring -->
        <div class="size-full overflow-hidden">
            <MediaImage
                :url="show.posterUrl"
                class="size-full transition-transform duration-300 group-has-[a:hover]:scale-110"
            />
        </div>
        <!-- TODO status summary-->
        <h2>
            <RouterLink
                :to="{
                    name: 'shows.show',
                    params: { show: show.slug },
                    query: $solid.hasLoggedIn() ? { url: show.url } : undefined,
                }"
                :title="show.name"
                class="absolute inset-0"
            >
                <div
                    class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <!-- TODO text outside of title attribute -->
                <span class="sr-only">
                    <!-- TODO status summary for a11y -->
                </span>
            </RouterLink>
        </h2>
    </article>
</template>

<script setup lang="ts">
import Show from '@/models/Show';

defineProps<{ show: Show }>();
</script>
