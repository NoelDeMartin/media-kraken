import lotr1JsonLD from '@tests/fixtures/jsonld/lotr-1.json';
import lotr2JsonLD from '@tests/fixtures/jsonld/lotr-2.json';
import spiritJsonLD from '@tests/fixtures/jsonld/spirit.json';

describe('Navigation', () => {

    const baseUrl = Cypress.config('baseUrl');

    beforeEach(() => {
        cy.visit('/');
        cy.startApp();
        cy.login();
        cy.addMovie(lotr1JsonLD);
        cy.addMovie(lotr2JsonLD);
        cy.addMovie(spiritJsonLD);
    });

    it('Uses hot keys to navigate and search/filter', () => {
        // Go to collection
        cy.get('body').type('c');
        cy.url().should('equal', `${baseUrl}/collection`);

        // Filter
        cy.get('body').type('f');
        cy.ariaLabel('Collection filter')
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

    it('Remembers collection filters', () => {
        // Open collection
        cy.contains('My Collection').click();

        cy.contains('The Fellowship of the Ring').should('be.visible');
        cy.contains('The Two Towers').should('be.visible');
        cy.contains('Spirit').should('be.visible');

        // Prepare filters
        cy.contains('All movies').click();
        cy.contains('Watched movies').click();
        cy.ariaLabel('Filter collection').click();
        cy.ariaLabel('Collection filter').type('lord');

        // Navigate to movie
        cy.contains('The Two Towers').click();

        // Go back
        cy.go('back');

        cy.contains('(1)').should('be.visible');
        cy.contains('The Fellowship of the Ring').should('not.exist');
        cy.contains('The Two Towers').should('be.visible');
        cy.contains('Spirit').should('not.exist');
    });

});
