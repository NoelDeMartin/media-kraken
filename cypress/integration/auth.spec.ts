import Faker from 'faker';

import { SolidAuthClient } from 'solid-auth-client';

import StubResponse from '@tests/stubs/StubResponse';

describe('Authentication', () => {

    beforeEach(() => {
        cy.visit('/');
    });

    it ('Logs in using browser storage', () => {
        cy.start({ useRealEngines: true });

        cy.contains('Use browser storage').click();

        cy.contains('Welcome!').should('be.visible');
    });

    it('Logs in using Solid POD', () => {
        const domain = Faker.internet.domainName();
        const name = Faker.name.firstName() + ' ' + Faker.name.lastName();
        const session = {
            idp: `https://${domain}`,
            webId: `https://${domain}/me`,
            accessToken: 'accessToken',
            idToken: 'idToken',
            clientId: 'clientId',
            sessionKey: 'sessionKey',
        };

        cy.require<SolidAuthClient>('solid-auth-client')
            .then(SolidAuthClient => {
                let sessionListener: Function;

                cy.stub(SolidAuthClient, 'trackSession', listener => sessionListener = listener);
                cy.stub(SolidAuthClient, 'login', url => {
                    if (url !== `https://${domain}`)
                        return;

                    sessionListener(session);
                });
                cy.stub(SolidAuthClient, 'fetch', url => {
                    switch (url) {
                        case `https://${domain}/me`:
                            return Promise.resolve(StubResponse.success(`
                                @prefix foaf: <http://xmlns.com/foaf/0.1/> .
                                @prefix pim: <http://www.w3.org/ns/pim/space#> .
                                @prefix solid: <http://www.w3.org/ns/solid/terms#> .

                                <${session.webId}>
                                    foaf:name "${name}" ;
                                    pim:storage </> ;
                                    solid:publicTypeIndex </settings/publicTypeIndex.ttl> .
                            `));
                        case `https://${domain}/settings/publicTypeIndex.ttl`:
                            return Promise.resolve(StubResponse.success(`
                                @prefix : <#> .
                                @prefix solid: <http://www.w3.org/ns/solid/terms#> .
                                @prefix schema: <https://schema.org/> .

                                <> a solid:TypeIndex .

                                :movies
                                    a solid:TypeRegistration ;
                                    solid:forClass schema:Movie ;
                                    solid:instanceContainer </movies/> .
                            `));
                        case `https://${domain}/movies/`:
                            return Promise.resolve(StubResponse.success(`
                                @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
                                @prefix ldp: <http://www.w3.org/ns/ldp#> .

                                <>
                                    rdfs:label "Movies" ;
                                    a ldp:Resource ;
                                    a ldp:Container .
                            `));
                        default:
                            return Promise.resolve(StubResponse.notFound());
                    }
                });
            });

        cy.start({ useRealEngines: true });

        cy.contains('Use Solid POD').click();
        cy.get('input[placeholder="Solid POD url"]').type(domain);
        cy.contains('Login').click();

        cy.contains('Welcome!').should('be.visible');
    });

});
