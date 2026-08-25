import { jsonldToQuads, type JsonLDGraph } from '@noeldemartin/solid-utils';

import movies from '@/lib/fixtures/solid/movies.jsonld';
import Movie from '@/models/Movie';

import { defineStub } from './helpers';

const quads = await Promise.all((movies as JsonLDGraph[]).map((graph) => jsonldToQuads(graph)));
const instances = await Movie.createManyFromRDF(quads.flat());

export default defineStub(instances.map((movie) => [movie.title, movie]));
