import Faker from 'faker';

import movies from '@tests/fixtures/movies.ttl';
import profile from '@tests/fixtures/profile.ttl';
import taxiDriverJson from '@tests/fixtures/taxi-driver-1976.json';
import taxiDriverTurtle from '@tests/fixtures/taxi-driver-1976.ttl';
import typeIndex from '@tests/fixtures/typeIndex.ttl';

describe('Authentication', () => {

    beforeEach(() => cy.visit('/'));

    it ('Logs in using browser storage', () => {
        // Arrange
        cy.start({ useRealEngines: true });

        // Act
        cy.contains('Use browser storage').click();

        // Assert
        cy.see('Welcome!');
    });

    it('Logs in using Solid POD', () => {
        // Arrange
        let sessionListener: Function;
        const domain = Faker.internet.domainName();

        cy.lib('solid-auth-client').then(SolidAuthClient => {
            cy.stub(SolidAuthClient, 'trackSession', l => sessionListener = l);
            cy.stub(SolidAuthClient, 'login', () => {
                const session = {
                    idp: `https://${domain}`,
                    webId: `https://${domain}/me`,
                    accessToken: 'accessToken',
                    idToken: 'idToken',
                    clientId: 'clientId',
                    sessionKey: 'sessionKey',
                };

                sessionListener(session);

                return session;
            });
        });

        cy.fetchRoute('/me', profile);
        cy.fetchRoute('/settings/publicTypeIndex.ttl', typeIndex);
        cy.fetchRoute('/movies/taxi-driver-1976.ttl', taxiDriverTurtle);
        cy.fetchRoute('/movies/', movies);

        cy.start({ useRealEngines: true });

        // Act
        cy.contains('Use Solid POD').click();
        cy.get('input[placeholder="Solid POD url"]').type(domain);
        cy.contains('Login').click();

        // Assert
        cy.seeImage(taxiDriverJson.image);
    });

});
