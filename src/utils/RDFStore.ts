import $rdf, { IndexedFormula, Node, NamedNode, Statement } from 'rdflib';
import SolidAuthClient from 'solid-auth-client';

const knownPrefixes: { [prefix: string]: (ln: string) => NamedNode; } = {
    solid: $rdf.Namespace('http://www.w3.org/ns/solid/terms#'),
    schema: $rdf.Namespace('https://schema.org/'),
    rdfs: $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
    foaf: $rdf.Namespace('http://xmlns.com/foaf/0.1/'),
    pim: $rdf.Namespace('http://www.w3.org/ns/pim/space#'),
};

export default class RDFStore {

    public static async fromUrl(url: string): Promise<RDFStore> {
        const store = $rdf.graph();
        const data = await SolidAuthClient.fetch(url).then(res => res.text());

        $rdf.parse(data, store, url, null as any, null as any);

        return new RDFStore(store);
    }

    private store: IndexedFormula;

    constructor(store: IndexedFormula) {
        this.store = store;
    }

    public nodes(predicate: any = null, object: any = null): Node[] {
        return this.store.each(
            null as any,
            this.resolveIRI(predicate),
            this.resolveIRI(object),
            null as any,
        );
    }

    public node(predicate: any = null, object: any = null): Node | null {
        return this.store.any(
            null as any,
            this.resolveIRI(predicate),
            this.resolveIRI(object),
            null as any,
        );
    }

    public statements(subject: any = null, predicate: any = null, object: any = null): Statement[] {
        return this.store.statementsMatching(
            this.resolveIRI(subject),
            this.resolveIRI(predicate),
            this.resolveIRI(object),
            null as any,
            false,
        );
    }

    public statement(subject: any = null, predicate: any = null, object: any = null): Statement | null {
        const statements = this.store.statementsMatching(
            this.resolveIRI(subject),
            this.resolveIRI(predicate),
            this.resolveIRI(object),
            null as any,
            true,
        );

        return statements.length > 0 ? statements[0] : null;
    }

    public contains(subject: any = null, predicate: any = null, object: any = null): boolean {
        return !!this.statement(subject, predicate, object);
    }

    private resolveIRI(iri: any): NamedNode {
        if (typeof iri !== 'string')
            return iri;

        const iriParts = iri.split(':');

        if (iriParts.length === 2 && iriParts[0] in knownPrefixes)
            return knownPrefixes[iriParts[0]](iriParts[1]);

        return $rdf.sym(iri);
    }

}
