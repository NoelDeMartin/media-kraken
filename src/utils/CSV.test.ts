import CSV from './CSV';

describe('CSV helpers', () => {

    it('parses CSV strings', () => {
        // Arrange
        const text = `
            First Name, Surname
            John, Doe
            Amy, Doe
        `;

        // Act
        const csv = CSV.parse(text);

        // Assert
        expect(csv).toEqual([
            { firstName: 'John', surname: 'Doe' },
            { firstName: 'Amy', surname: 'Doe' },
        ]);
    });

});
