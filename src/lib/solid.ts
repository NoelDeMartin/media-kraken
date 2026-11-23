import solid from '@aerogel/plugin-solid';
import { arrayUnique } from '@noeldemartin/utils';

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export default function () {
    return solid({
        onUserProfileLoaded(profile, store) {
            profile.friends = arrayUnique(
                store
                    .statements(profile.webId, 'foaf:knows')
                    .filter((statement) => statement.object.termType === 'NamedNode')
                    .map((statement) => statement.object.value),
            );
        },
    });
}

declare module '@noeldemartin/solid-utils' {
    interface SolidUserProfileBase {
        friends?: string[];
    }
}
