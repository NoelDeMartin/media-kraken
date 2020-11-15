<template>
    <BaseTransition
        :enabled="$ui.desktop"
        :leave-duration="200"
        :enter-duration="300"
        enter-active-class="delay-100"
        animation="fade"
    >
        <div
            v-show="$ui.mobile || !$search.open"
            class="inset-y-0 z-50"
            :class="{
                'fixed w-screen pr-10 transition-all duration-300': $ui.mobile,
                'absolute right-0': $ui.desktop,
                'right-full': $ui.mobile && !$ui.menuOpen,
                'right-0': $ui.mobile && $ui.menuOpen,
            }"
        >
            <div
                ref="mobile-menu"
                class="
                    h-full p-6 flex flex-col bg-white shadow
                    desktop:p-0 desktop:flex-row desktop:items-center desktop:bg-transparent desktop:shadow-none
                "
            >
                <div v-if="$ui.mobile && !$auth.isOffline" class="flex items-center">
                    <UserAvatar
                        v-if="user.avatarUrl"
                        class="w-16 h-16 mr-4 flex-shrink-0 rounded-full text-primary-900 outline-none shadow-solid"
                    />
                    <div class="flex flex-col overflow-hidden">
                        <span class="truncate text-lg font-bold">
                            {{ user.name }}
                        </span>
                        <a
                            v-if="userWebId"
                            :href="userWebId"
                            target="blank"
                            class="truncate text-sm text-gray-700 hover:underline"
                        >
                            {{ userWebId }}
                        </a>
                    </div>
                </div>
                <nav class="desktop:mt-0" :class="{ 'mt-4': $ui.mobile && !$auth.isOffline }">
                    <BaseLink
                        v-show="!$media.empty"
                        ref="my-collection"
                        v-close-menu
                        route="collection"
                        class="
                            flex items-center h-8 font-semibold text-lg mb-2
                            desktop:text-sm desktop:mr-4 desktop:mb-0
                        "
                        :title="$route.name !== 'collection' ? 'Press &quot;c&quot; to open your collection' : null"
                        :class="{ 'underline': $route.name === 'collection' }"
                    >
                        My Collection
                    </BaseLink>
                </nav>
                <button
                    v-show="$ui.desktop"
                    ref="button"
                    type="button"
                    aria-label="Application options"
                    :style="user.avatarUrl ? '' : 'margin-left:-.375rem;margin-right:-.375rem'"
                    :class="{
                        'rounded-full text-primary-900 focus:outline-none focus:shadow-solid': user.avatarUrl,
                        'flex w-8 h-8 text-gray-700 items-center justify-center hover:text-gray-800':
                            !user.avatarUrl,
                    }"
                    @click="$ui.toggleMenu()"
                >
                    <UserAvatar v-if="user.avatarUrl" class="w-12 h-12 rounded-full" />
                    <BaseIcon v-else name="cog" class="w-5 h-5" />
                </button>
                <BaseTransition :enabled="$ui.desktop" :duration="100" animations="fade scale">
                    <div
                        v-show="$ui.menuOpen || $ui.mobile"
                        ref="desktop-menu"
                        class="
                            w-56 right-0 top-full mt-2 origin-top-right
                            rounded-md
                            desktop:absolute desktop:shadow-lg
                        "
                        :class="{
                            'pb-1 rounded-lg bg-white border border-gray-300 overflow-hidden': $ui.desktop,
                            '-mt-4': $ui.desktop && !user.avatarUrl,
                        }"
                    >
                        <div
                            v-if="$ui.desktop && !$auth.isOffline"
                            class="flex flex-col p-4 overflow-hidden bg-gray-200 border-b border-gray-300"
                        >
                            <span class="truncate font-bold mb-1">
                                {{ user.name }}
                            </span>
                            <a
                                v-if="userWebId"
                                :href="userWebId"
                                target="blank"
                                class="truncate text-sm text-gray-700 hover:underline"
                            >
                                {{ userWebId }}
                            </a>
                        </div>
                        <div class="-mt-4 desktop:mt-0">
                            <button
                                v-for="menuOption of menuOptions"
                                :key="menuOption.name"
                                v-close-menu
                                type="button"
                                class="flex items-center text-gray-700"
                                :class="{
                                    'text-lg mt-4 focus:underline hover:underline': $ui.mobile,
                                    'px-4 py-2 w-full text-sm hover:bg-gray-100 hover:text-gray-900': $ui.desktop,
                                }"
                                @click="menuOption.handler"
                            >
                                <BaseIcon
                                    :name="menuOption.icon"
                                    class="mr-2"
                                    :class="{
                                        'w-3 h-3': $ui.desktop,
                                        'w-5 h-5': $ui.mobile,
                                    }"
                                />
                                <span class="truncate">{{ menuOption.name }}</span>
                            </button>
                        </div>
                    </div>
                </BaseTransition>
            </div>
        </div>
    </BaseTransition>
</template>

<script lang="ts">
import Vue from 'vue';

import Services from '@/services';

import Time from '@/utils/Time';

import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

import SettingsModal from '@/components/modals/SettingsModal.vue';
import UserAvatar from '@/components/UserAvatar.vue';

interface MenuOption {
    name: string;
    icon: string;
    handler: Function;
}

export default Vue.extend({
    components: {
        UserAvatar,
    },
    directives: {
        closeMenu: {
            bind: el => el.addEventListener('click', () => Services.$ui.closeMenu()),
        },
    },
    computed: {
        user(): User {
            return this.$auth.user!;
        },
        menuOptions(): MenuOption[] {
            const optionHandler = (handler: Function) => async () => {
                // If this isn't done, logging out in offline mode causes a weird UI
                // interaction with the appearance animation of the confirmation modal.
                // TODO this shouldn't be necessary, debug further.
                await Time.wait(0);

                handler();
            };

            return [
                { name: 'Settings', icon: 'wrench', handler: optionHandler(() => this.$ui.openModal(SettingsModal)) },
                { name: 'Log out', icon: 'logout', handler: optionHandler(() => this.$auth.logout()) },
            ];
        },
        userWebId(): string | null {
            return this.$auth.user instanceof SolidUser
                ? this.$auth.user.id
                : null;
        },
    },
    mounted() {
        this.$ui.setMobileMenu(this.$refs['mobile-menu'] as HTMLElement);
        this.$ui.setDesktopMenu(this.$refs['desktop-menu'] as HTMLElement);
        this.$ui.addMenuTrigger(this.$refs['button'] as HTMLButtonElement);
        this.$ui.setMyCollection((this.$refs['my-collection'] as Vue).$el as HTMLElement);
    },
    beforeDestroy() {
        this.$ui.setMobileMenu(null);
        this.$ui.setDesktopMenu(null);
        this.$ui.removeMenuTrigger(this.$refs['button'] as HTMLButtonElement);
        this.$ui.setMyCollection(null);
    },
});
</script>
