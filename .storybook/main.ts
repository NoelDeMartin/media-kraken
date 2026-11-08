import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.tsx'],
    addons: ['@storybook/addon-docs'],
    framework: '@storybook/vue3-vite',
    core: {
        disableTelemetry: true,
        allowedHosts: process.env.STORYBOOK_ALLOWED_HOSTS?.split(','),
    },
    features: {
        sidebarOnboardingChecklist: false,
    },
    viteFinal(viteConfig) {
        const hmrClientPort = Number(process.env.STORYBOOK_HMR_CLIENT_PORT) || undefined;

        if (hmrClientPort && typeof viteConfig.server?.ws === 'object') {
            viteConfig.server.ws.clientPort = hmrClientPort;
        }

        return viteConfig;
    },
};

export default config;
