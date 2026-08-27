import { jsonldToQuads, type JsonLDGraph } from '@noeldemartin/solid-utils';

import shows from '@/lib/fixtures/solid/shows.jsonld';
import Show from '@/models/Show';

import { defineStub } from './helpers';

const quads = await Promise.all((shows as JsonLDGraph[]).map((graph) => jsonldToQuads(graph)));
const instances = await Show.createManyFromRDF(quads.flat());

export default defineStub(instances.map((show) => [show.name, show]));
