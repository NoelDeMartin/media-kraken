import { jsonldToQuads, type JsonLDGraph } from '@noeldemartin/solid-utils';
import { DAY_MILLISECONDS } from '@noeldemartin/utils';

import shows from '@/lib/fixtures/solid/shows.jsonld';
import Episode from '@/models/Episode';
import Show from '@/models/Show';

import { defineStub } from './helpers';

async function refreshPendingEpisodes(show: Show) {
    await show.getComputedAttribute('pendingEpisodes').updateValue({
        refresh: true,
    });
}

const quads = await Promise.all((shows as JsonLDGraph[]).map((graph) => jsonldToQuads(graph)));
const instances = await Show.createManyFromRDF(quads.flat());
const episodes = await Episode.createManyFromRDF(quads.flat());
const pluribus = instances.find((show) => show.name === 'Pluribus');

for (const episode of episodes) {
    showsLoop: for (const show of instances) {
        for (const season of show.seasons ?? []) {
            if (season.episodeUrls.includes(episode.url)) {
                episode.relatedWatched.related = null;
                season.relatedEpisodes.related ??= [];
                season.relatedEpisodes.related.push(episode);

                await refreshPendingEpisodes(show);

                continue showsLoop;
            }
        }
    }
}

if (pluribus) {
    const season = pluribus.seasons?.find((s) => s.number === 1) ?? pluribus.relatedSeasons.attach({ number: 1 });
    const episode = season.relatedEpisodes.attach({
        number: 4,
        name: 'Please, Carol',
        publishedAt: new Date(Date.now() + 3 * DAY_MILLISECONDS),
    });

    episode.mintUrl();

    episode.relatedWatched.related = null;

    await refreshPendingEpisodes(pluribus);
}

export default defineStub(instances.map((show) => [show.name, show]));
