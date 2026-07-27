import { defineSchema } from 'soukai-bis';
import { string, boolean, url } from 'zod';

export default defineSchema({
    fields: {
        title: string(),
        posterUrl: url(),
        watched: boolean(),
    },
});
