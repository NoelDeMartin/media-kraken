import type { StyleValue } from 'vue';

const MEDIA_GRID_ANIMATION_DURATION = 300;
const MEDIA_GRID_DEFAULT_ITEM_WIDTH = '9rem';

export const MEDIA_GRID_CLASSES = 'grid grid-cols-[repeat(auto-fill,minmax(var(--media-grid-item-width),1fr))] gap-6';

function playAnimation(
    element: Element,
    keyframes: Keyframe[],
    options: KeyframeEffectOptions,
    onFinish: () => void,
): void {
    const animation = new Animation(
        new KeyframeEffect(element, keyframes, { duration: MEDIA_GRID_ANIMATION_DURATION, ...options }),
    );

    animation.addEventListener('finish', () => onFinish());
    animation.play();
}

export function mediaGridStyle(itemWidth: string = MEDIA_GRID_DEFAULT_ITEM_WIDTH): StyleValue {
    return { '--media-grid-item-width': itemWidth };
}

export function fadeInGridItem(element: Element, done: () => void): void {
    playAnimation(element, [{ opacity: 0 }, { opacity: 1 }], { easing: 'ease-out' }, done);
}

export function fadeOutGridItem(element: Element, done: () => void): void {
    element.setAttribute('inert', '');

    playAnimation(element, [{ opacity: 1 }, { opacity: 0 }], { easing: 'ease-in', fill: 'forwards' }, done);
}

export function flyOutGridItem(element: Element, target: Element, done: () => void): void {
    const elementRect = element.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const x = targetRect.left + targetRect.width / 2 - elementRect.left;
    const y = targetRect.top + targetRect.height / 2 - elementRect.top;

    element.setAttribute('inert', '');

    playAnimation(
        element,
        [
            { transformOrigin: 'top left', transform: 'none', opacity: 1 },
            {
                transformOrigin: 'top left',
                transform: `translate(${x}px, ${y}px) scale(0.1) translate(-50%, -50%)`,
                opacity: 0.1,
            },
        ],
        { easing: 'ease-in', fill: 'forwards' },
        done,
    );
}
