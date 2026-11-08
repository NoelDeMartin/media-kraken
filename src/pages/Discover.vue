<template>
    <Page>
        <PageTitle>{{ $t('discover.title') }}</PageTitle>
        <ul>
            <li v-for="{ friend, list } of friendLists" :key="list.url">
                <ListCard :owner="friend" :list :media-by-url="mediaMap" class="size-60" />
            </li>
        </ul>
        <!-- TODO friends lists -->
        <!-- TODO viewer -->
        <!-- TODO TMDB recommendations (by genre, top directors, top actors, etc.) -->
    </Page>
</template>

<script setup lang="ts">
import { Solid } from '@aerogel/plugin-solid';
import { fetchSolidDocument, type SolidUserProfile } from '@noeldemartin/solid-utils';
import { isTruthy } from '@noeldemartin/utils';
import { runWithEngine, TypeIndex } from 'soukai-bis';
import { onMounted, ref } from 'vue';

import List from '@/modules/lists/models/List';

const mediaMap = new Map();
const friendLists = ref<{ friend: SolidUserProfile; list: List }[]>([]);

onMounted(async () => {
    const profileFriends = Solid.user?.friends ?? [];

    for (const friend of profileFriends) {
        const friendProfile = await Solid.getUserProfile(friend);

        if (friendProfile) {
            for (const typeIndexUrl of friendProfile.publicTypeIndexUrls) {
                const typeIndexDocument = await fetchSolidDocument(typeIndexUrl);
                const typeIndex = await TypeIndex.createFromDocument(typeIndexDocument, { url: typeIndexUrl });

                // TODO replace hard-coded schema.org/ItemList and /Movie
                // TODO findInstance?
                const listRegistrations = await Promise.all(
                    typeIndex?.registrations?.map(async (registration) => {
                        if (!registration.forClass.includes('https://schema.org/ItemList') || !registration.instance) {
                            return;
                        }

                        const about = typeIndexDocument.statements(registration.instance, 'schema:about');

                        if (!about?.find((quad) => quad.object.value === 'https://schema.org/Movie')) {
                            return;
                        }

                        return registration;
                    }) ?? [],
                );

                for (const listRegistration of listRegistrations.filter(isTruthy)) {
                    const list = await runWithEngine(
                        Solid.requireEngine(),
                        () => listRegistration.instance && List.find(listRegistration.instance),
                    );

                    list && friendLists.value.push({ friend: friendProfile, list });
                }
            }
        }
    }
});
</script>
