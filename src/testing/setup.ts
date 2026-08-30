import 'soukai-bis/patch-zod';
import { bootCoreModels, bootModelsFromViteGlob } from 'soukai-bis';
import { beforeAll } from 'vitest';

import models from '@/models';

beforeAll(async () => {
    bootCoreModels({ reset: true });
    bootModelsFromViteGlob(models, { reset: true });
});
