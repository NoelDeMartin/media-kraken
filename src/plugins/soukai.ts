import Soukai, { definitionsFromContext } from 'soukai';
import SoukaiSolid from 'soukai-solid';

Soukai.loadModels(definitionsFromContext(require.context('@/models/soukai')));
SoukaiSolid.loadSolidModels();
