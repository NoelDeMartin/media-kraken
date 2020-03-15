<template>
    <AppModal @close="$ui.closeModal(id)">
        <span class="font-semibold text-2xl m-4">
            Do you need help to log in?
        </span>
        <hr class="border-gray-500">
        <div class="p-4">
            <span class="font-medium text-kraken-darkest mt-4 mb-2">
                Login with Solid
            </span>
            <div class="text-sm text-gray-800">
                <p class="tracking-wide leading-relaxed mb-2">
                    If you want to keep your data and access it from other devices, you should probably
                    login with Solid. Solid is a decentralized storage protocol that decouples applications
                    from data.
                </p>
                <p class="tracking-wide leading-relaxed mb-2">
                    In order to log in with Solid, you need to own a Solid POD and give permissions to
                    this application so that it can read and write data. You can get a POD
                    <BaseLink :blank="true" href="https://solid.inrupt.com/get-a-solid-pod" class="underline">
                        here
                    </BaseLink>.
                </p>
                <BaseLink :blank="true" href="https://solidproject.org" class="underline self-start">
                    learn more
                </BaseLink>
            </div>
        </div>
        <hr class="border-gray-500">
        <div class="p-4">
            <span class="font-medium text-kraken-darkest mt-4 mb-2">
                Login Offline
            </span>
            <div class="text-sm text-gray-800">
                <p class="tracking-wide leading-relaxed mb-2">
                    If you only want to try the app or you don't care about losing your data, you should
                    probably login Offline. Offline mode will store your data in localStorage so it won't
                    be accessible from other devices and it may get removed if you clear the history in
                    your browser (or use private mode).
                </p>
                <BaseLink :blank="true" href="https://en.wikipedia.org/wiki/Web_storage" class="underline self-start">
                    learn more
                </BaseLink>
            </div>
        </div>
    </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';

import AppModal from '@/components/AppModal.vue';

export default Vue.extend({
    components: {
        AppModal,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
});
</script>
