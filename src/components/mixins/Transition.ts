import mixins from 'vue-typed-mixins';
import Vue from 'vue';

import Services from '@/services';

enum Animation {
    Fade = 'fade',
    Scale = 'scale',
    ResizeWidth = 'resize-width',
    ResizeHeight = 'resize-height',
    SlideUp = 'slide-up',
}

interface Data {
    animationsEnabled: boolean;
}

interface TransitionClasses {
    enterActive: string;
    enter: string;
    enterTo: string;
    leaveActive: string;
    leave: string;
    leaveTo: string;
}

interface VueTransitionProps {
    appear: boolean;
    duration: number | { enter: number; leave: number };
    enterActiveClass: string;
    enterClass: string;
    enterToClass: string;
    leaveActiveClass: string;
    leaveClass: string;
    leaveToClass: string;
}

interface ComponentListeners {
    [key: string]: Function | Function[];
}

interface VueTransitionListeners extends ComponentListeners {
    beforeLeave(el: HTMLElement): void;
}

type TransitionClassesArrays = { [entry in keyof TransitionClasses]?: string[] };

export default mixins(Vue.extend({
    props: {
        enabled: {
            type: Boolean,
            default: true,
        },
        appear: {
            type: Boolean,
            default: false,
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
    data: (): Data => ({
        // This is necessary because animations that get disabled once they've started get broken,
        // so this can only be changed on component initialization.
        animationsEnabled: Services.$ui.animationsEnabled,
    }),
    computed: {
        durations(): { enter: number; leave: number} {
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
        vueTransitionProps(): VueTransitionProps {
            return {
                appear: this.appear,
                duration: this.durations,
                enterActiveClass: this.transitionClasses.enterActive,
                enterClass: this.transitionClasses.enter,
                enterToClass: this.transitionClasses.enterTo,
                leaveActiveClass: this.transitionClasses.leaveActive,
                leaveClass: this.transitionClasses.leave,
                leaveToClass: this.transitionClasses.leaveTo,
            };
        },
        vueTransitionListeners(): VueTransitionListeners {
            return {
                beforeLeave: el => this.$emit('before-leave', el),
            };
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
                        leaveTo: ['opacity-0'],
                    };
                case Animation.Scale:
                    return {
                        enterActive: ['transform'],
                        enter: ['scale-90'],
                        leaveActive: ['transform'],
                        leaveTo: ['scale-90'],
                    };
                case Animation.ResizeWidth:
                    return {
                        enter: ['max-w-0'],
                        enterTo: ['max-w-full'],
                        leave: ['max-w-full'],
                        leaveTo: ['max-w-0'],
                    };
                case Animation.ResizeHeight:
                    return {
                        enter: ['max-h-0'],
                        leaveTo: ['max-h-0'],
                    };
                case Animation.SlideUp:
                    return {
                        enterActive: ['transform'],
                        enter: ['translate-y-full'],
                        leaveActive: ['transform'],
                        leaveTo: ['translate-y-full'],
                    };
            }
        },
    },
}));
