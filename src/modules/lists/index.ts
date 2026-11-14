import { defineModule } from '@aerogel/core';

import routes, { bindings } from '@lists/pages';
import { services } from '@lists/services';

export default defineModule({
    routes,
    bindings,
    services,
});
