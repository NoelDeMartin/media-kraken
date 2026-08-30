import type Episode from '@/models/Episode';
import type EpisodeWatched from '@/models/EpisodeWatched';
import type Movie from '@/models/Movie';
import type Season from '@/models/Season';
import type Show from '@/models/Show';
import type ShowWatching from '@/models/ShowWatching';
import type WatchAction from '@/models/WatchAction';

export default import.meta.glob(['@/models/*', '!**/*.test.ts'], { eager: true }) as Record<
    string,
    Record<string, unknown>
>;

declare module 'soukai-bis' {
    interface ModelsRegistry {
        Episode: typeof Episode;
        EpisodeWatched: typeof EpisodeWatched;
        Movie: typeof Movie;
        Season: typeof Season;
        Show: typeof Show;
        ShowWatching: typeof ShowWatching;
        WatchAction: typeof WatchAction;
    }
}
