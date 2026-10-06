import type Episode from '@/models/Episode';
import type EpisodeWatched from '@/models/EpisodeWatched';
import type Movie from '@/models/Movie';
import type PerformanceRole from '@/models/PerformanceRole';
import type Person from '@/models/Person';
import type Season from '@/models/Season';
import type Show from '@/models/Show';
import type ShowWatching from '@/models/ShowWatching';
import type WatchAction from '@/models/WatchAction';

declare module 'soukai-bis' {
    interface ModelsRegistry {
        Episode: typeof Episode;
        EpisodeWatched: typeof EpisodeWatched;
        Movie: typeof Movie;
        PerformanceRole: typeof PerformanceRole;
        Person: typeof Person;
        Season: typeof Season;
        Show: typeof Show;
        ShowWatching: typeof ShowWatching;
        WatchAction: typeof WatchAction;
    }
}
