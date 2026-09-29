import 'soukai-bis/patch-zod';
import { bootCoreModels, bootModelsFromViteGlob } from 'soukai-bis';
import { beforeAll } from 'vite-plus/test';

import models from '@/models';

beforeAll(async () => {
    bootCoreModels({ reset: true });
    bootModelsFromViteGlob(models, { reset: true });
});
