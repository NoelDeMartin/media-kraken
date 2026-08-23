import { defineEnv } from '@aerogel/core';
import { z } from 'zod';

const EnvSchema = z.object({
    VITE_TMDB_API_KEY: z.string(),
});

export default defineEnv(import.meta.env, EnvSchema);

declare module '@aerogel/core' {
    interface Env extends z.infer<typeof EnvSchema> {}
}
