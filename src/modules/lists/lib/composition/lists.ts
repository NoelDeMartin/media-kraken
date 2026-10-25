import { findTrackedModel } from '@aerogel/plugin-solid';
import { computed, ref, shallowRef, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';

import type { Media } from '@/lib/media';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

export type MediaByUrl = Map<string, Media>;

async function findMedia(url: string): Promise<Media | null> {
    if (url.startsWith(Show.defaultContainerUrl)) {
        return (await findTrackedModel(Show, url)) ?? (await findTrackedModel(Movie, url));
    }

    return (await findTrackedModel(Movie, url)) ?? (await findTrackedModel(Show, url));
}

export function useListMedia(urls: () => string[]): {
    mediaByUrl: Readonly<Ref<MediaByUrl>>;
    loading: ComputedRef<boolean>;
} {
    const mediaByUrl = shallowRef<MediaByUrl>(new Map());
    const requestedUrls = new Set<string>();
    const pendingRequests = ref(0);

    watch(
        urls,
        async (currentUrls) => {
            const missingUrls = currentUrls.filter((url) => !requestedUrls.has(url));

            if (missingUrls.length === 0) {
                return;
            }

            missingUrls.forEach((url) => requestedUrls.add(url));
            pendingRequests.value++;

            try {
                const media = await Promise.all(missingUrls.map(findMedia));
                const updatedMediaByUrl = new Map(mediaByUrl.value);

                missingUrls.forEach((url, index) => {
                    const item = media[index];

                    if (!item) {
                        requestedUrls.delete(url);

                        return;
                    }

                    updatedMediaByUrl.set(url, item);
                });

                mediaByUrl.value = updatedMediaByUrl;
            } finally {
                pendingRequests.value--;
            }
        },
        { immediate: true },
    );

    return {
        mediaByUrl,
        loading: computed(() => pendingRequests.value > 0),
    };
}
