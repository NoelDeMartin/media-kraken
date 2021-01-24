<template>
    <div class="bg-primary-100 p-4 rounded text-sm text-center desktop:text-left">
        <p class="text-gray-800">
            You were logged in with <a
                class="font-medium hover:underline"
                :href="loginUrl"
                target="_blank"
            >{{ loginUrl }}</a>
        </p>

        <div class="flex flex-col-reverse items-center mt-4 desktop:flex-row desktop:justify-end">
            <BaseLink class="mr-2" @click="$emit('forget')">
                Forget it
            </BaseLink>
            <BaseButton
                class="
                    border border-primary-500 text-sm text-primary-700 justify-center mb-4
                    hover:bg-black-overlay desktop:mb-0
                "
                @click="$emit('login')"
            >
                Log in again
            </BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        loginUrl: {
            type: String,
            required: true,
        },
    },
});
</script>
