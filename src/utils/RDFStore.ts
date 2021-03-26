import { DocumentFormat, Fetch, MalformedDocumentError } from 'soukai-solid';
import { Parser as TurtleParser } from 'n3';
import { Quad } from 'rdf-js';

import NetworkRequestError from '@/errors/NetworkRequestError';
import UnauthorizedError from '@/errors/UnauthorizedError';

const knownPrefixes: { [prefix: string]: string } = {
    foaf: 'http://xmlns.com/foaf/0.1/',
    pim: 'http://www.w3.org/ns/pim/space#',
    purl: 'http://purl.org/dc/terms/',
    rdfs: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    schema: 'https://schema.org/',
    solid: 'http://www.w3.org/ns/solid/terms#',
    vcard: 'http://www.w3.org/2006/vcard/ns#',
};

export default class RDFStore {

    public static async fromUrl(fetch: Fetch, url: string): Promise<RDFStore> {
        const data = await this.fetchData(fetch, url);

        return this.parse(url, data);
    }

    private static async fetchData(fetch: Fetch, url: string): Promise<string> {
        const options = { headers: { 'Accept': 'text/turtle' } };

        try {
            const response = await fetch(url, options);

            if ([401, 403].includes(response.status))
                throw new UnauthorizedError(response.status === 403, url);

            return response.text();
        } catch (error) {
            if (error instanceof UnauthorizedError)
                throw error;

            throw new NetworkRequestError(url);
        }
    }

    private static parse(url: string, data: string): Promise<RDFStore> {
        const quads: Quad[] = [];
        const parser = new TurtleParser({
            baseIRI: url,
            format: 'text/turtle',
        });

        return new Promise((resolve, reject) => {
            parser.parse(data, (error, quad) => {
                if (error) {
                    reject(new MalformedDocumentError(url, DocumentFormat.RDF, error.message));
                    return;
                }

                if (!quad) {
                    resolve(new RDFStore(quads));
                    return;
                }

                quads.push(quad);
            });
        });
    }

    private _statements: Quad[];

    private constructor(statements: Quad[]) {
        this._statements = statements;
    }

    public statements(subject: any = null, predicate: any = null, object: any = null): Quad[] {
        return this._statements.filter(
            statement =>
                (subject === null || statement.subject.value === this.resolveIRI(subject)) &&
                (predicate === null || statement.predicate.value === this.resolveIRI(predicate)) &&
                (object === null || statement.object.value === this.resolveIRI(object)),
        );
    }

    public statement(subject: any = null, predicate: any = null, object: any = null): Quad | null {
        return this._statements.find(
            statement =>
                (subject === null || statement.subject.value === this.resolveIRI(subject)) &&
                (predicate === null || statement.predicate.value === this.resolveIRI(predicate)) &&
                (object === null || statement.object.value === this.resolveIRI(object)),
        ) || null;
    }

    public contains(subject: any = null, predicate: any = null, object: any = null): boolean {
        return this.statement(subject, predicate, object) !== null;
    }

    private resolveIRI(iri: any): string {
        if (typeof iri !== 'string' || iri.startsWith('http'))
            return iri;

        const [prefix, name] = iri.split(':');

        if (!!name && prefix in knownPrefixes)
            return knownPrefixes[prefix] + name;

        return iri;
    }

}
