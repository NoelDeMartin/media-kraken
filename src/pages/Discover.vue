<template>
    <Page>
        <PageTitle>{{ $t('discover.title') }}</PageTitle>
        <SectionTitle class="mt-6">
            <i-ph-users-three class="size-6" />
            {{ $t('discover.friendsLists') }}
        </SectionTitle>
        <div v-if="!$solid.hasLoggedIn()" class="mt-4 flex flex-col items-center gap-4 py-8 text-center">
            <p class="text-gray-600">{{ $t('discover.guest') }}</p>
            <Button @click="connect()">{{ $t('discover.connect') }}</Button>
        </div>
        <div
            v-else-if="!$solid.isLoggedIn() && !$solid.loginOngoing"
            class="mt-4 flex flex-col items-center gap-4 py-8 text-center"
        >
            <p class="text-gray-600">{{ $t('discover.disconnected') }}</p>
            <Button @click="$solid.reconnect()">{{ $t('discover.reconnect') }}</Button>
        </div>
        <div
            v-else-if="(loading || !$solid.isLoggedIn()) && friendsLists.length === 0"
            class="flex items-center justify-center py-16"
        >
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>
        <p v-else-if="friendsLists.length === 0" class="mt-8 text-center text-gray-600">
            {{ friendsCount === 0 ? $t('discover.noFriends') : $t('discover.noLists') }}
        </p>
        <MediaGrid v-else class="mt-4" item-width="16rem">
            <ListCard v-for="{ owner, list } of sortedFriendsLists" :key="list.url" :list :owner />
        </MediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { Errors, UI } from '@aerogel/core';
import { AccountLoginModal } from '@aerogel/plugin-local-first';
import { Solid, userDisplayName } from '@aerogel/plugin-solid';
import type { SolidUserProfile } from '@noeldemartin/solid-utils';
import { isDevelopment } from '@noeldemartin/utils';
import type { ModelWithUrl } from 'soukai-bis';
import { computed, ref, shallowRef, watch } from 'vue';

import { sortByLocale } from '@/lib/media';
import { fetchFriends, fetchPublicLists } from '@lists/lib/discovery';
import type List from '@lists/models/List';

let loadId = 0;
const loading = ref(false);
const friendsCount = ref(0);
const friendsLists = shallowRef<{ owner: SolidUserProfile; list: ModelWithUrl<List> }[]>([]);
const sortedFriendsLists = computed(() => sortByLocale(friendsLists.value, ({ list }) => list.name));

async function connect(): Promise<void> {
    await UI.modal(AccountLoginModal);
}

function appendFriendLists(owner: SolidUserProfile, lists: ModelWithUrl<List>[]): void {
    const existingUrls = new Set(friendsLists.value.map(({ list }) => list.url));
    const newLists = lists.filter((list) => !existingUrls.has(list.url)).map((list) => ({ owner, list }));

    if (newLists.length > 0) {
        friendsLists.value = friendsLists.value.concat(newLists);
    }
}

async function loadFriendLists(owner: SolidUserProfile, isStale: () => boolean): Promise<void> {
    try {
        const lists = await fetchPublicLists(owner);

        if (isStale()) {
            return;
        }

        appendFriendLists(owner, lists);
    } catch (error) {
        if (isStale() || !isDevelopment()) {
            return;
        }

        // oxlint-disable-next-line no-console
        console.error(`Lists shared by ${userDisplayName(owner)} couldn't be loaded`, error);
    }
}

async function loadFriendsLists(): Promise<void> {
    const currentLoadId = ++loadId;
    const isStale = () => currentLoadId !== loadId;

    friendsLists.value = [];
    friendsCount.value = 0;

    if (!Solid.isLoggedIn()) {
        loading.value = false;

        return;
    }

    loading.value = true;

    try {
        const friends = await fetchFriends();

        if (isStale()) {
            return;
        }

        friendsCount.value = friends.length;

        await Promise.all(friends.map((owner) => loadFriendLists(owner, isStale)));
    } catch (error) {
        if (!isStale()) {
            await Errors.report(error);
        }
    } finally {
        if (!isStale()) {
            loading.value = false;
        }
    }
}

watch([() => Solid.user?.webId, () => Solid.isLoggedIn()], loadFriendsLists, { immediate: true });
</script>
