import { jsonldToQuads, type JsonLDGraph } from '@noeldemartin/solid-utils';

import shows from '@/lib/fixtures/solid/shows.jsonld';
import Episode from '@/models/Episode';
import Show from '@/models/Show';

import { defineStub } from './helpers';

const quads = await Promise.all((shows as JsonLDGraph[]).map((graph) => jsonldToQuads(graph)));
const instances = await Show.createManyFromRDF(quads.flat());
const episodes = await Episode.createManyFromRDF(quads.flat());

for (const episode of episodes) {
    for (const show of instances) {
        for (const season of show.seasons ?? []) {
            if (season.episodeUrls.includes(episode.url)) {
                episode.relatedWatched.related = null;
                season.relatedEpisodes.related ??= [];
                season.relatedEpisodes.related.push(episode);

                await show.getComputedAttribute('pendingEpisodeDates').updateValue({
                    refresh: true,
                    useCache: false,
                    loadRelations: false,
                });

                break;
            }
        }
    }
}

export default defineStub(instances.map((show) => [show.name, show]));
