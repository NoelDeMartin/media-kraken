import { arr, stringToSlug } from '@noeldemartin/utils';

interface ResetOptions {
    typeIndex: boolean;
    moviesContainer: boolean;
    movies: string[];
}

interface CSSAuthorizeOptions {
    reset: boolean | Partial<ResetOptions>;
}

const cssPodUrl = 'http://localhost:4000';
const queuedRequests = arr<{ url: string; options: RequestInit }>();

function cssLogin() {
    cy.get('#email').type('alice@example.com');
    cy.get('#password').type('secret');
    cy.contains('button', 'Log in').click();
    cy.contains('button', 'Consent').click();
}

function cssRegister() {
    cy.contains('Sign up').click();
    cy.get('#email').type('alice@example.com');
    cy.get('#password').type('secret');
    cy.get('#confirmPassword').type('secret');
    cy.get('#podName').type('alice');
    cy.contains('button', 'Sign up').click();
    cy.contains('a', 'log in').click();
}

function cssResetPOD(options: Partial<ResetOptions> = {}) {
    // Delete previous data
    cy.queueUpdatingSolidDocument('/alice/profile/card', 'remove-type-index.sparql');
    cy.queueDeletingSolidDocument('/alice/settings/privateTypeIndex');
    cy.queueDeletingSolidDocument('/alice/movies/spirited-away');
    cy.queueDeletingSolidDocument('/alice/movies/metropolis');
    cy.queueDeletingSolidDocument('/alice/movies/');

    // Create new data
    if (options.typeIndex) {
        cy.queueCreatingSolidDocument('/alice/settings/privateTypeIndex', 'type-index.ttl');
        cy.queueUpdatingSolidDocument('/alice/profile/card', 'add-type-index.sparql');
    }

    if (options.moviesContainer) {
        cy.queueCreatingSolidContainer('/alice/', 'Movies');
        cy.queueUpdatingSolidDocument('/alice/settings/privateTypeIndex', 'register-movies-container.sparql');
    }

    (options.movies ?? []).forEach(movie => {
        cy.queueCreatingSolidDocument(`/alice/movies/${movie}`, `${movie}.ttl`);
    });
}

export function queueAuthenticatedRequests(window: Window): void {
    queuedRequests.map(({ url, options }) => window.testing?.queueAuthenticatedRequest(url, options));
    queuedRequests.clear();
}

export default {

    cssAuthorize(options: Partial<CSSAuthorizeOptions> = {}): void {
        const requestOptions = {
            url: `${cssPodUrl}/alice/profile/card`,
            failOnStatusCode: false,
        };

        cy.request(requestOptions).then(({ isOkStatusCode }) => {
            if (!isOkStatusCode) {
                cssRegister();
            }

            cssLogin();
        });

        if (options.reset)
            cssResetPOD(typeof options.reset === 'object' ? options.reset : {});
    },

    queueAuthenticatedRequest(url: string, options: RequestInit): void {
        queuedRequests.push({ url, options });
    },

    queueCreatingSolidContainer(parentUrl: string, name: string): void {
        cy.queueAuthenticatedRequest(cssPodUrl + parentUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/turtle',
                'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
                'Slug': stringToSlug(name),
            },
            body: `<> <http://www.w3.org/2000/01/rdf-schema#label> "${name}" .`,
        });
    },

    queueCreatingSolidDocument(url: string, fixture: string): void {
        cy.fixture(fixture).then(body => {
            cy.queueAuthenticatedRequest(cssPodUrl + url, {
                method: 'PUT',
                headers: { 'Content-Type': 'text/turtle' },
                body,
            });
        });
    },

    queueDeletingSolidDocument(url: string): void {
        cy.queueAuthenticatedRequest(cssPodUrl + url, { method: 'DELETE' });
    },

    queueUpdatingSolidDocument(url: string, fixture: string): void {
        cy.fixture(fixture).then(body => {
            cy.queueAuthenticatedRequest(cssPodUrl + url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/sparql-update' },
                body,
            });
        });
    },

};
