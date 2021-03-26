<template>
    <div class="relative">
        <div ref="trigger">
            <slot :toggle="toggleMenu" />
        </div>
        <BaseTransition :duration="100" animations="fade scale">
            <div
                v-show="open"
                ref="menu"
                class="absolute mt-2 w-56 rounded-md shadow-lg z-20"
                :class="{
                    'origin-top-left left-0': direction === 'top-left',
                    'origin-top-right right-0': direction === 'top-right',
                }"
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
import { after } from '@noeldemartin/utils';
import Vue from 'vue';

interface Data {
    removeClickAwayListener: Function | null;
}

export interface MenuOption {
    text: string;
    icon?: string;
    handle(option: MenuOption): void;
}

export default Vue.extend({
    props: {
        options: {
            type: Array as () => MenuOption[],
            required: true,
        },
        direction: {
            type: String,
            default: 'top-left',
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

            this.$emit('opened');
        },
        closeMenu() {
            if (!this.removeClickAwayListener)
                return;

            this.removeClickAwayListener();
            this.removeClickAwayListener = null;

            after({ milliseconds: 100 }).then(() => this.$emit('closed'));
        },
        triggerOption(option: MenuOption) {
            this.closeMenu();

            option.handle(option);
        },
    },
});
</script>
