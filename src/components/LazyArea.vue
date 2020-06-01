<template>
    <div>
        <slot v-if="forceVisible || visible" />
        <slot v-else name="placeholder" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

interface Data {
    visible: boolean;
    $_observer?: IntersectionObserver;
}

export default Vue.extend({
    props: {
        forceVisible: {
            type: Boolean,
            default: false,
        },
    },
    data: (): Data => ({ visible: false }),
    mounted() {
        this.$_observer = new IntersectionObserver(([entry]) => this.visible = entry.isIntersecting);
        this.$_observer.observe(this.$el);
    },
    destroyed() {
        if (!this.$_observer)
            return;

        this.$_observer.disconnect();
        delete this.$_observer;
    },
});
</script>
