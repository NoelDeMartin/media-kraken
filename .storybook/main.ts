import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.tsx'],
    addons: ['@storybook/addon-docs'],
    framework: '@storybook/vue3-vite',
    core: {
        disableTelemetry: true,
    },
    features: {
        sidebarOnboardingChecklist: false,
    },
};

export default config;
