import movies from '@tests/fixtures/movies.json';

describe('Media', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.startApp();
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

    it('Imports movies from JSON-LD', () => {
        cy.buttonWithTitle('Import from JSON-LD').click();
        cy.uploadFixture('collection.json');

        cy.see('1 movies have been added to your collection to watch later');
        cy.see('1 watched movies have been added to your collection');

        cy.contains('OK').click();
        cy.contains('My Collection').click();

        cy.reload();
        cy.see('Collection (2)');

        cy.get('a[href$="/movies/love-exposure-2009"]').click();
        cy.see('watched');

        cy.contains('My Collection').click();
        cy.get('a[href$="/movies/big-man-japan-2007"]').click();
        cy.see('watch later');
    });

});
