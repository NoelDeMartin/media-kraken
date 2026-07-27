import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.ts'],
    addons: [],
    framework: '@storybook/vue3-vite',
};

export default config;
