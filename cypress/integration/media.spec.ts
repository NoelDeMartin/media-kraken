import jaws from '@tests/fixtures/jaws-1975.json';
import loveExposure from '@tests/fixtures/love-exposure-2008.json';
import movies from '@tests/fixtures/movies.json';
import symbol from '@tests/fixtures/symbol-2009.json';

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
        cy.seeImage(loveExposure.image);

        cy.visit('/collection');
        cy.startApp();
        cy.seeImage(loveExposure.image);
    });

    it('Imports movies from JSON-LD', () => {
        // Act
        cy.buttonWithTitle('Import from JSON-LD').click();
        cy.uploadFixture('collection.json');

        // Assert
        cy.see('1 movies have been added to your collection to watch later');
        cy.see('1 watched movies have been added to your collection');

        cy.contains('OK').click();
        cy.contains('My Collection').click();

        cy.see('Collection (2)');
        cy.seeImage(symbol.image);
        cy.seeImage(jaws.image);

        cy.get('a[href$="/movies/symbol-2009"]').click();
        cy.see('watched');

        cy.contains('My Collection').click();
        cy.get('a[href$="/movies/jaws-1975"]').click();
        cy.see('watch later');

        cy.visit('/collection');
        cy.startApp();
        cy.seeImage(symbol.image);
        cy.seeImage(jaws.image);
    });

});
