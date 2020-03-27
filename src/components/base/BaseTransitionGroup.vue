<script lang="ts">
import { CreateElement, VNode } from 'vue';

import Transition from '@/components/mixins/Transition';

export default Transition.extend({
    props: {
        tag: {
            type: String,
            default: 'div',
        },
        moveDuration: {
            type: Number,
            default: null,
        },
        moveClass: {
            type: String,
            default: '',
        },
    },
    render(h: CreateElement): VNode {
        if (!this.enabled)
            return this.$slots.default as any as VNode;

        return h(
            'transition-group',
            {
                props: {
                    tag: this.tag,
                    moveClass: [
                        'transition-all',
                        'duration-' + (this.moveDuration || this.duration),
                        ...this.moveClass.split(' '),
                    ].join(' '),
                    ...this.vueTransitionProps,
                },
                on: this.vueTransitionListeners,
            },
            this.$slots.default,
        );
    },
});
</script>
