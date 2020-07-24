<script lang="ts">
import { CreateElement, VNode } from 'vue';

import Transition from '@/components/mixins/Transition';

export default Transition.extend({
    render(h: CreateElement): VNode {
        if (!this.animationsEnabled || !this.enabled)
            return this.$slots.default as any as VNode;

        return h(
            'transition',
            {
                props: this.vueTransitionProps,
                on: this.vueTransitionListeners,
            },
            this.$slots.default,
        );
    },
});
</script>
