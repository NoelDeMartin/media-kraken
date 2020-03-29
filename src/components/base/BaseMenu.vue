<template>
    <div class="relative">
        <div ref="trigger" @click="toggleMenu">
            <slot />
        </div>
        <BaseTransition :duration="100" animations="fade scale">
            <div
                v-show="open"
                ref="menu"
                class="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg z-20"
            >
                <div class="rounded-md bg-white shadow-xs">
                    <div v-for="(option, index) of options" :key="index" class="py-1">
                        <button
                            type="button"
                            class="
                                flex items-center
                                block px-4 py-2 text-sm leading-5 text-gray-700 w-full
                                hover:bg-gray-100 hover:text-gray-900
                                focus:outline-none focus:bg-gray-100 focus:text-gray-900
                            "
                            @click="triggerOption(option)"
                        >
                            <BaseIcon v-if="option.icon" :name="option.icon" class="w-3 h-3 mr-2" />
                            <span>{{ option.text }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </BaseTransition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

interface Data {
    removeClickAwayListener: Function | null;
}

interface MenuOption {
    text: string;
    icon?: string;
    handle(): void;
}

export default Vue.extend({
    props: {
        options: {
            type: Array as () => MenuOption[],
            required: true,
        },
    },
    data: (): Data => ({
        removeClickAwayListener: null,
    }),
    computed: {
        open(): boolean {
            return !!this.removeClickAwayListener;
        },
    },
    methods: {
        toggleMenu() {
            this.open ? this.closeMenu() : this.openMenu();
        },
        openMenu() {
            if (this.removeClickAwayListener)
                return;

            this.removeClickAwayListener = this.$ui.onClickAway(
                [
                    this.$refs.trigger as HTMLElement,
                    this.$refs.menu as HTMLElement,
                ],
                () => this.closeMenu(),
            );
        },
        closeMenu() {
            if (!this.removeClickAwayListener)
                return;

            this.removeClickAwayListener();
            this.removeClickAwayListener = null;
        },
        triggerOption({ handle }: MenuOption) {
            this.closeMenu();

            handle();
        },
    },
});
</script>
