import type { Options } from '@aerogel/plugin-solid';

export const authConfig: Options = {
    onUserProfileLoaded(profile, store) {
        profile.friends = store.statements(profile.webId, 'foaf:knows').map((s) => s.object.value);
    },
};

declare module '@noeldemartin/solid-utils' {
    interface SolidUserProfileBase {
        friends?: string[];
    }
}
