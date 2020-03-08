<script lang="ts">
import Vue, { CreateElement, VNode } from 'vue';

import Arr from '@/utils/Arr';

interface TransitionClasses {
    enterActive: string;
    enter: string;
    enterTo: string;
    leaveActive: string;
    leave: string;
    leaveTo: string;
}

type TransitionClassesArrays = { [entry in keyof TransitionClasses]?: string[] };

enum Animation {
    Fade = 'fade',
    Scale = 'scale',
    ResizeWidth = 'resize-width',
}

export default Vue.extend({
    props: {
        enabled: {
            type: Boolean,
            default: true,
        },
        duration: {
            type: Number,
            default: 300,
        },
        enterDuration: {
            type: Number,
            default: null,
        },
        leaveDuration: {
            type: Number,
            default: null,
        },
        animations: {
            type: String,
            default: null,
        },
        animation: {
            type: String as () => Animation,
            default: null,
        },
        enterActiveClass: {
            type: String,
            default: '',
        },
        enterClass: {
            type: String,
            default: '',
        },
        enterToClass: {
            type: String,
            default: '',
        },
        leaveActiveClass: {
            type: String,
            default: '',
        },
        leaveClass: {
            type: String,
            default: '',
        },
        leaveToClass: {
            type: String,
            default: '',
        },
    },
    computed: {
        durations(): { enter: number, leave: number} {
            return {
                enter: this.enterDuration || this.duration,
                leave: this.leaveDuration || this.duration,
            };
        },
        transitionClasses(): TransitionClasses {
            const animations = (this.animations
                ? this.animations.split(' ')
                : (this.animation ? [this.animation] : [])) as Animation[];

            const transitionClassesArrays = animations.reduce(this.mergeAnimationClasses, {
                enterActive: [
                    'transition-all',
                    'ease-out',
                    'duration-' + this.durations.enter,
                    ...this.enterActiveClass.split(' '),
                ],
                enter: this.enterClass.split(' '),
                enterTo: this.enterToClass.split(' '),
                leaveActive: [
                    'transition-all',
                    'ease-in',
                    'duration-' + this.durations.leave,
                    ...this.leaveActiveClass.split(' '),
                ],
                leave: this.leaveClass.split(' '),
                leaveTo: this.leaveToClass.split(' '),
            });

            return Object.entries(transitionClassesArrays).reduce((transitionClasses, [phase, classes]) => {
                transitionClasses[phase] = classes!.join(' ');

                return transitionClasses;
            }, {} as any) as TransitionClasses;
        },
    },
    methods: {
        mergeAnimationClasses(classes: TransitionClassesArrays, animation: Animation): TransitionClassesArrays {
            const animationClasses = this.resolveAnimationClasses(animation) || {};

            for (const p in animationClasses) {
                const phase = p as keyof TransitionClassesArrays;

                classes[phase]!.push(...animationClasses[phase]!);
            }

            return classes;
        },
        resolveAnimationClasses(animation: Animation): TransitionClassesArrays {
            switch (animation) {
                case Animation.Fade:
                    return {
                        enter: ['opacity-0'],
                        enterTo: ['opacity-100'],
                        leave: ['opacity-100'],
                        leaveTo: ['opacity-0'],
                    };
                case Animation.Scale:
                    return {
                        enterActive: ['transform'],
                        enter: ['scale-90'],
                        enterTo: ['scale-100'],
                        leaveActive: ['transform'],
                        leave: ['scale-100'],
                        leaveTo: ['scale-90'],
                    };
                case Animation.ResizeWidth:
                    return {
                        enter: ['max-w-0'],
                        enterTo: ['max-w-full'],
                        leave: ['max-w-full'],
                        leaveTo: ['max-w-0'],
                    };
            }
        },
    },
    render(h: CreateElement): VNode {
        if (!this.enabled)
            return this.$slots.default as any as VNode;

        const { durations, transitionClasses } = this as any;

        return h(
            'transition',
            {
                props: {
                    duration: durations,
                    enterActiveClass: transitionClasses.enterActive,
                    enterClass: transitionClasses.enter,
                    enterToClass: transitionClasses.enterTo,
                    leaveActiveClass: transitionClasses.leaveActive,
                    leaveClass: transitionClasses.leave,
                    leaveToClass: transitionClasses.leaveTo,
                },
            },
            this.$slots.default,
        );
    },
});
</script>
