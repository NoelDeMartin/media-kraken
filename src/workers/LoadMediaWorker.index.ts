import './setupWorkerGlobals';

import LoadMediaWorker from './LoadMediaWorker';

(new LoadMediaWorker).listen();
