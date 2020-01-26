import Soukai, { definitionsFromContext } from 'soukai';

Soukai.loadModels(definitionsFromContext(require.context('@/models/soukai')));
