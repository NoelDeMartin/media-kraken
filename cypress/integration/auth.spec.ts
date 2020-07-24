import { Session } from 'solid-auth-client';
import Faker from 'faker';

import emptyTypeIndex from '@tests/fixtures/turtle/emptyTypeIndex.ttl';
import movies from '@tests/fixtures/turtle/movies.ttl';
import populatedTypeIndex from '@tests/fixtures/turtle/populatedTypeIndex.ttl';
import profile from '@tests/fixtures/turtle/profile.ttl';
import taxiDriver from '@tests/fixtures/json/taxi-driver.json';
import taxiDriverTurtle from '@tests/fixtures/turtle/taxi-driver-1976.ttl';

interface SolidLoginContext {
    listener?: Function;
    session?: Session;
}

function stubSolidAuth(
    domain: string,
    options: {
        context?: SolidLoginContext;
        signup?: boolean;
    } = {},
): SolidLoginContext {
    const context = options.context || {};
    const signup = options.signup ?? false;
    const typeIndex = signup ? emptyTypeIndex : populatedTypeIndex;

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
    cy.fetchRoute('/settings/privateTypeIndex.ttl', typeIndex);

    if (!signup) {
        cy.fetchRoute('/movies/taxi-driver-1976.ttl', taxiDriverTurtle);
        cy.fetchRoute('/movies/', movies);
    }

    return context;
}

describe('Authentication', () => {

    beforeEach(() => cy.visit('/'));

    it('Helps visitors decide what to use', () => {
        // Arrange
        cy.startApp();

        // Act
        cy.contains('Help me decide what to use').click();

        // Assert
        cy.see('If you want to secure your data and access it from other devices, you should use Solid.');
        cy.see(
            'If you only want to try the app or you don\'t want to synchronize with other devices, ' +
            'you should use browser storage.',
        );
    });

    it('Signs up with browser storage', () => {
        // Arrange
        cy.startApp();

        // Act
        cy.contains('Use browser storage').click();

        // Assert
        cy.see('Welcome to Media Kraken!');

        cy.reload();
        cy.see('Welcome to Media Kraken!');
    });

    it('Logs out with browser storage and clears client data', () => {
        // Arrange
        cy.startApp();
        cy.contains('Use browser storage').click();
        cy.see('Welcome to Media Kraken!');

        // Act
        cy.ariaLabel('Application options').click();
        cy.contains('Log out').click();

        // Assert
        cy.indexedDBShouldBeEmpty();
        cy.localStorageShouldBeEmpty();
    });

    it('Signs up with Solid', () => {
        // Arrange
        const domain = Faker.internet.domainName();

        stubSolidAuth(domain, { signup: true });

        cy.startApp();

        // Act
        cy.contains('Use Solid').click();
        cy.get('input[placeholder="Solid POD url"]').type(domain);
        cy.contains('Login').click();

        // Assert
        cy.see('Welcome to Media Kraken!').then(() => cy.getFetchCalls().then(calls => {
            const typeCalls = calls[`https://${domain}/settings/privateTypeIndex.ttl`];

            expect(typeCalls).to.have.lengthOf(5);

            expect(typeCalls[1].options.method || 'GET').to.eq('GET');
            expect(typeCalls[2].options.method || 'GET').to.eq('GET');
            expect(typeCalls[3].options.method || 'GET').to.eq('PATCH');
            expect(typeCalls[3].options.body).to.contain('<https://schema.org/Movie>');
            expect(typeCalls[4].options.method || 'GET').to.eq('PATCH');
            expect(typeCalls[4].options.body).to.contain('<https://schema.org/WatchAction>');
        }));
    });

    it('Logs in with Solid', () => {
        // Arrange
        const domain = Faker.internet.domainName();
        const loginContext = stubSolidAuth(domain);

        cy.startApp();

        // Act
        cy.contains('Use Solid').click();
        cy.get('input[placeholder="Solid POD url"]').type(domain);
        cy.contains('Login').click();

        // Assert
        cy.seeImage(taxiDriver.image, { timeout: 10000 });

        cy.visit('/collection');
        stubSolidAuth(domain, { context: loginContext });
        cy.startApp();
        cy.seeImage(taxiDriver.image, { timeout: 10000 });
    });

    it('Logs out with Solid and clears client data', () => {
        // Arrange
        const domain = Faker.internet.domainName();

        stubSolidAuth(domain);

        cy.startApp();
        cy.contains('Use Solid').click();
        cy.get('input[placeholder="Solid POD url"]').type(domain);
        cy.contains('Login').click();
        cy.seeImage(taxiDriver.image, { timeout: 10000 });

        // Act
        cy.ariaLabel('Application options').click();
        cy.contains('Log out').click();

        // Assert
        cy.indexedDBShouldBeEmpty();
        cy.localStorageShouldBeEmpty();
    });

    it('Logs out in mobile layout', () => {
        // Arrange
        cy.viewport('samsung-s10');
        cy.startApp();
        cy.login();

        // Act
        cy.ariaLabel('Open menu').click();
        cy.contains('Log out').click();

        // Assert
        cy.url().should('include', '/login');
    });

});
