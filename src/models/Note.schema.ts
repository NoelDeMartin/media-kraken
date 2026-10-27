import { defineSchema } from 'soukai-bis';
import { string, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'NoteDigitalDocument',
    history: true,
    fields: {
        aboutUrl: url().rdfProperty('about'),
        text: string(),
        encodingFormat: string().default('text/markdown'),
    },
});
