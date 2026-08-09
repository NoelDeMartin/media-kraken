import { defineSchema } from 'soukai-bis';
import { string } from 'zod';

export default defineSchema({
    fields: {
        title: string(),
    },
});
