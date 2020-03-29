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
                <div v-if="$ui.mobile" class="flex items-center">
                    <UserAvatar class="w-16 h-16 mr-4 flex-shrink-0 rounded-full text-primary-900 outline-none shadow-solid" />
                    <div class="flex flex-col overflow-hidden">
                        <span class="truncate text-lg font-bold">
                            {{ $auth.user.name }}
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
                <nav class="mt-4 desktop:mt-0">
                    <BaseLink
                        v-show="!$media.empty"
                        ref="my-collection"
                        v-close-menu
                        route="collection"
                        class="font-semibold desktop:text-sm desktop:mr-4"
                        :class="{ 'underline': $route.name === 'collection' }"
                    >
                        My Collection
                    </BaseLink>
                </nav>
                <button
                    v-show="$ui.desktop"
                    ref="button"
                    type="button"
                    :class="{
                        'rounded-full text-primary-900 focus:outline-none focus:shadow-solid': $auth.user.avatarUrl,
                        'text-gray-700 hover:text-gray-800': !$auth.user.avatarUrl,
                    }"
                    @click="$ui.toggleMenu()"
                >
                    <UserAvatar v-if="$auth.user.avatarUrl" class="w-12 h-12 rounded-full" />
                    <BaseIcon v-else name="cog" class="w-5 h-5" />
                </button>
                <div class="flex-grow" />
                <BaseTransition :enabled="$ui.desktop" :duration="100" animations="fade scale">
                    <div
                        v-show="$ui.menuOpen || $ui.mobile"
                        ref="desktop-menu"
                        class="
                            w-42 right-0 top-full mt-2 origin-top-right
                            rounded-md
                            desktop:absolute desktop:shadow-lg
                        "
                        :class="{
                            'pb-1 rounded-lg bg-white border border-gray-300 overflow-hidden': $ui.desktop,
                            '-mt-4': $ui.desktop && !$auth.user.avatarUrl,
                        }"
                    >
                        <div v-if="$ui.desktop && !$auth.isOffline" class="flex flex-col p-4 overflow-hidden bg-gray-200 border-b border-gray-300">
                            <span class="truncate font-bold mb-1">
                                {{ $auth.user.name }}
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
                        <button
                            type="button"
                            class="flex items-center text-gray-800 hover:underline"
                            :class="{
                                'text-lg': $ui.mobile,
                                'px-4 py-2 w-full text-sm': $ui.desktop,
                            }"
                            @click="$auth.logout()"
                        >
                            <BaseIcon name="logout" class="w-4 h-4 mr-2" /> <span>Logout</span>
                        </button>
                    </div>
                </BaseTransition>
            </div>
        </div>
    </BaseTransition>
</template>

<script lang="ts">
import Vue from 'vue';

import SolidUser from '@/models/users/SolidUser';

import UserAvatar from '@/components/UserAvatar.vue';

export default Vue.extend({
    components: {
        UserAvatar,
    },
    directives: {
        closeMenu: {
            bind: el => el.addEventListener('click', () => Vue.instance.$ui.closeMenu()),
        },
    },
    computed: {
        userWebId(): string | null {
            if (!(this.$auth.user instanceof SolidUser))
                return null;

            return this.$auth.user.id;
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
