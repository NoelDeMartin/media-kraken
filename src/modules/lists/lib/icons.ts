import type { Component } from 'vue';
import IconPublic from '~icons/ph/globe-hemisphere-west';
import IconLink from '~icons/ph/link';
import IconLock from '~icons/ph/lock';

import type { ListVisibility } from '@lists/lib/sharing';

export const LIST_VISIBILITY_ICONS: Record<ListVisibility, Component> = {
    public: IconPublic,
    unlisted: IconLink,
    private: IconLock,
};
