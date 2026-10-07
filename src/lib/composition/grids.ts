import { computed, onScopeDispose, ref, watch } from 'vue';

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function useGridAnimations(animate: () => boolean) {
    const paused = ref(false);
    const animationsEnabled = computed(() => !paused.value && animate());
    let resumeAnimationsFrame: number | null = null;

    function cancelResumeAnimations() {
        if (resumeAnimationsFrame === null) {
            return;
        }

        cancelAnimationFrame(resumeAnimationsFrame);

        resumeAnimationsFrame = null;
    }

    function pauseAnimations() {
        paused.value = true;

        cancelResumeAnimations();

        resumeAnimationsFrame = requestAnimationFrame(() => {
            resumeAnimationsFrame = null;
            paused.value = false;
        });
    }

    watch(animate, () => pauseAnimations());
    onScopeDispose(cancelResumeAnimations);

    return { animationsEnabled, pauseAnimations };
}
