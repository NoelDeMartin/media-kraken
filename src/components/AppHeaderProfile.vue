<template>
    <BaseTransition
        :leave-duration="200"
        :enter-duration="300"
        enter-active-class="transition-delay-100"
        animation="fade"
    >
        <div v-show="!$search.searching" class="absolute right-0 inset-y-0 flex items-center">
            <router-link
                class="mr-4 text-sm text-kraken-darkest font-bold hover:underline"
                :to="{ name: 'collection' }"
                :class="{ 'underline': $route.name === 'collection' }"
            >
                My Collection
            </router-link>
            <button
                ref="button"
                type="button"
                class="rounded-full text-kraken-darkest focus:outline-none focus:shadow-solid"
                @click="toggleMenu()"
            >
                <img class="h-12 w-12 rounded-full" src="https://placekitten.com/48/48">
            </button>
            <BaseTransition animations="fade scale">
                <div
                    v-show="menuOpen"
                    ref="menu"
                    class="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg top-full"
                >
                    <div class="py-1 rounded-lg bg-white shadow border border-gray-300">
                        <button
                            type="button"
                            class="block px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-100"
                            @click="$auth.logout()"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </BaseTransition>
        </div>
    </BaseTransition>
</template>

<script lang="ts">
import Vue from 'vue';

interface Data {
    menuOpen: boolean;
    clickListener: EventListener | null;

    $refs?: {
        button: HTMLButtonElement,
        menu: HTMLElement,
    };
}

export default Vue.extend({
    data: (): Data => ({
        menuOpen: false,
        clickListener: null,
    }),
    methods: {
        toggleMenu() {
            this.menuOpen = !this.menuOpen;

            this.menuOpen
                ? this.startListeningClicks()
                : this.stopListeningClicks();
        },
        startListeningClicks() {
            if (this.clickListener)
                return;

            document.addEventListener('click', this.clickListener = e => {
                const target = e.target as HTMLElement;
                const { button, menu } = this.$refs;

                if (target === button || target === menu || button.contains(target) || menu.contains(target))
                    return;

                this.toggleMenu();
            });
        },
        stopListeningClicks() {
            if (!this.clickListener)
                return;

            document.removeEventListener('click', this.clickListener);

            this.clickListener = null;
        },
    },
});
</script>
