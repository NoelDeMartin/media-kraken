import { Session } from 'solid-auth-client';
import Faker from 'faker';

import movies from '@tests/fixtures/movies.ttl';
import profile from '@tests/fixtures/profile.ttl';
import taxiDriverJson from '@tests/fixtures/taxi-driver-1976.json';
import taxiDriverTurtle from '@tests/fixtures/taxi-driver-1976.ttl';
import typeIndex from '@tests/fixtures/typeIndex.ttl';

interface SolidLoginContext {
    listener?: Function;
    session?: Session;
}

function stubSolidLogin(
    domain: string,
    context: SolidLoginContext = {},
): SolidLoginContext {
    cy.lib('solid-auth-client').then(SolidAuthClient => {
        cy.stub(SolidAuthClient, 'trackSession', listener => {
            context.listener = listener;

            if (context.session)
                listener(context.session);
        });
        cy.stub(SolidAuthClient, 'login', () => {
            context.session = {
                idp: `https://${domain}`,
                webId: `https://${domain}/me`,
                accessToken: 'accessToken',
                idToken: 'idToken',
                clientId: 'clientId',
                sessionKey: 'sessionKey',
            };

            context.listener && context.listener(context.session);
        });
    });

    cy.fetchRoute('/me', profile);
    cy.fetchRoute('/settings/publicTypeIndex.ttl', typeIndex);
    cy.fetchRoute('/movies/taxi-driver-1976.ttl', taxiDriverTurtle);
    cy.fetchRoute('/movies/', movies);

    return context;
}

describe('Authentication', () => {

    beforeEach(() => cy.visit('/'));

    it('Logs in using browser storage', () => {
        // Arrange
        cy.startApp();

        // Act
        cy.contains('Use browser storage').click();

        // Assert
        cy.see('Welcome!');
    });

    it('Logs out with browser storage and clears client data', () => {
        // Arrange
        cy.startApp();
        cy.contains('Use browser storage').click();
        cy.see('Welcome!');
        cy.reload();

        // Act
        cy.ariaLabel('Settings').click();
        cy.contains('Log out').click();

        // Assert
        cy.indexedDBShouldBeEmpty();
        cy.localStorageShouldBeEmpty();
    });

    it('Logs in with Solid', () => {
        // Arrange
        const domain = Faker.internet.domainName();

        stubSolidLogin(domain);

        cy.startApp();

        // Act
        cy.contains('Use Solid POD').click();
        cy.get('input[placeholder="Solid POD url"]').type(domain);
        cy.contains('Login').click();

        // Assert
        cy.seeImage(taxiDriverJson.image);
    });

    it('Logs out with Solid and clears client data', () => {
        // Arrange
        const domain = Faker.internet.domainName();
        const loginContext = stubSolidLogin(domain);

        cy.startApp();
        cy.contains('Use Solid POD').click();
        cy.get('input[placeholder="Solid POD url"]').type(domain);
        cy.contains('Login').click();
        cy.seeImage(taxiDriverJson.image);
        cy.visit('/');

        stubSolidLogin(domain, loginContext);

        cy.startApp();

        // Act
        cy.ariaLabel('Settings').click();
        cy.contains('Log out').click();

        // Assert
        cy.indexedDBShouldBeEmpty();
        cy.localStorageShouldBeEmpty();
    });

});
