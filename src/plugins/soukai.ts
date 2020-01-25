import Soukai, { LocalStorageEngine, definitionsFromContext } from 'soukai';

Soukai.loadModels(definitionsFromContext(require.context('@/models')));
Soukai.useEngine(new LocalStorageEngine('media-tracker'));
