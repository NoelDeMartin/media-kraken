import spiritLD from '@tests/fixtures/jsonld/spirit.json';

describe('Navigation', () => {

    const baseUrl = Cypress.config('baseUrl');

    beforeEach(() => {
        cy.visit('/');
        cy.startApp();
        cy.login();
        cy.addMovie(spiritLD);
    });

    it('Uses hot keys to navigate and search/filter', () => {
        // Go to collection
        cy.get('body').type('c');
        cy.url().should('equal', `${baseUrl}/collection`);

        // Filter
        cy.get('body').type('f');
        cy.ariaLabel('Filter collection')
          .should('be.focused')
          .type('{esc}')
          .should('not.be.focused');

        // Go home
        cy.get('body').type('h');
        cy.url().should('equal', `${baseUrl}/`);

        // Search
        cy.get('body').type('/');
        cy.ariaLabel('Search box')
          .should('be.focused')
          .type('{esc}')
          .should('not.be.focused');
    });

});
