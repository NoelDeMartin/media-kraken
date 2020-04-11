import Obj from './Obj';

describe('Object utils', () => {

    it('Creates an object with a subset of properties', () => {
        const o = { foo: true, bar: true };

        expect(Obj.only(o, ['foo'])).toEqual({ foo: true });
    });

});
