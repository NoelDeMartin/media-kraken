import 'soukai-bis/patch-zod';
import { FakeLocalStorage } from '@noeldemartin/testing';
import { bootCoreModels, bootModelsFromViteGlob } from 'soukai-bis';
import { beforeAll, beforeEach } from 'vite-plus/test';

FakeLocalStorage.patchGlobal();

beforeAll(async () => {
    const { default: models } = await import('@/models');

    bootCoreModels({ reset: true });
    bootModelsFromViteGlob(models, { reset: true });
});

beforeEach(() => {
    FakeLocalStorage.reset();
});
