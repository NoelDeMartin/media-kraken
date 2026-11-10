<template>
    <Modal :title="$t('lists.share.title')" wrapper-class="sm:max-w-lg">
        <template v-if="!shareableList">
            <p class="text-sm text-gray-600">
                {{ $solid.hasLoggedIn() ? $t('lists.share.disconnected') : $t('lists.share.guest') }}
            </p>
            <div class="mt-4 flex justify-end gap-2">
                <Button variant="secondary" @click="close()">{{ $t('ui.cancel') }}</Button>
                <Button @click="connect()">
                    {{ $solid.hasLoggedIn() ? $t('lists.share.reconnect') : $t('lists.share.connect') }}
                </Button>
            </div>
        </template>
        <div v-else class="flex flex-col gap-4">
            <div v-if="error" role="alert" class="rounded-md bg-red-50 p-3 text-sm text-red-700">
                <p>{{ $t(error.message) }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                    <Button variant="danger" @click="retry()">
                        {{ $t('lists.share.retry') }}
                    </Button>
                    <Button variant="secondary" @click="$errors.inspect(error.source)">
                        {{ $t('lists.share.errorDetails') }}
                    </Button>
                </div>
            </div>
            <div v-if="!visibility && !error" class="py-8 text-center">
                <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
                <span class="sr-only">{{ $t('lists.share.loading') }}</span>
            </div>
            <RadioGroupRoot
                v-if="visibility"
                :model-value="visibility"
                :disabled="updating"
                :aria-label="$t('lists.share.visibility')"
                class="flex flex-col gap-2"
                @update:model-value="(value) => update(value as ListVisibility)"
            >
                <RadioGroupItem
                    v-for="(icon, option) of icons"
                    :key="option"
                    :value="option"
                    class="group focus-visible:outline-primary-500 data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-50 flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 not-data-[state=checked]:enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <component
                        :is="icon"
                        class="group-data-[state=checked]:text-primary-600 mt-0.5 size-5 shrink-0 text-gray-500"
                    />
                    <span class="min-w-0 flex-1">
                        <span class="block text-sm font-medium text-gray-900">
                            {{ $t(`lists.share.${option}`) }}
                        </span>
                        <span class="block text-sm text-gray-500">
                            {{ $t(`lists.share.${option}Description`) }}
                        </span>
                    </span>
                    <i-svg-spinners-90-ring-with-bg
                        v-if="updating && pendingVisibility === option"
                        class="text-primary-500 size-5 shrink-0 self-center"
                    />
                    <span v-else class="size-5 shrink-0 self-center">
                        <RadioGroupIndicator as-child>
                            <i-mdi-check class="text-primary-600 size-5" />
                        </RadioGroupIndicator>
                    </span>
                </RadioGroupItem>
            </RadioGroupRoot>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { UI, useModal } from '@aerogel/core';
import { AccountLoginModal } from '@aerogel/plugin-local-first';
import { Solid } from '@aerogel/plugin-solid';
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'reka-ui';
import { computed, onMounted, ref } from 'vue';
import type { Component } from 'vue';
import IconPublic from '~icons/ph/globe-hemisphere-west';
import IconLink from '~icons/ph/link';
import IconLock from '~icons/ph/lock';

import { canShareList, fetchListVisibility, updateListVisibility } from '@lists/lib/sharing';
import type { ListVisibility } from '@lists/lib/sharing';
import type List from '@lists/models/List';

const icons: Record<ListVisibility, Component> = { public: IconPublic, unlisted: IconLink, private: IconLock };
const { list } = defineProps<{ list: List }>();
const { close } = useModal();
const shareableList = canShareList(list) ? list : null;
const visibility = ref<ListVisibility | null>(null);
const pendingVisibility = ref<ListVisibility | null>(null);
const updating = computed(() => !!pendingVisibility.value);
const error = ref<{ message: string; source: unknown; retry(): Promise<void> } | null>(null);

async function connect() {
    await close();

    if (Solid.hasLoggedIn()) {
        await Solid.reconnect();

        return;
    }

    await UI.modal(AccountLoginModal);
}

async function retry() {
    const failedOperation = error.value?.retry;

    error.value = null;

    await failedOperation?.();
}

async function fetchVisibility() {
    if (!shareableList) {
        return;
    }

    try {
        visibility.value = await fetchListVisibility(shareableList);
    } catch (fetchError) {
        error.value = { message: 'lists.share.fetchError', source: fetchError, retry: fetchVisibility };
    }
}

async function update(newVisibility: ListVisibility) {
    if (!shareableList || newVisibility === visibility.value) {
        return;
    }

    error.value = null;
    pendingVisibility.value = newVisibility;

    try {
        await updateListVisibility(shareableList, newVisibility);

        visibility.value = newVisibility;
    } catch (updateError) {
        error.value = {
            message: 'lists.share.updateError',
            source: updateError,
            retry: () => update(newVisibility),
        };
    } finally {
        pendingVisibility.value = null;
    }
}

onMounted(() => fetchVisibility());
</script>
