import Arr from './Arr';

describe('Array utils', () => {

    it('chunks arrays', () => {
        expect(Arr.chunk([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3))
            .toEqual([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
                [10],
            ]);
    });

});
