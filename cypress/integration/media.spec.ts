import movies from '@tests/fixtures/movies.json';

describe('Media', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.start();
        cy.login();
    });

    it('Adds movies from search', () => {
        // Arrange
        cy.fetchRoute('/search/movie', { results: [movies['love-exposure']] });
        cy.fetchRoute('/movie', movies['love-exposure']);

        // Act
        cy.get('body').type('s');
        cy.get('body').type('Love Exposure');
        cy.ariaLabel('Search results').contains('Love Exposure').click();
        cy.ariaRole('dialog').contains('watch later').click();

        // Assert
        cy.see('Love Exposure has been added to your collection!');
    });

});
