import Str from './Str';

describe('String utils', () => {

    it('removes accents from slugs', () => {
        expect(Str.slug('Sin perdón')).toEqual('sin-perdon');
        expect(Str.slug('Mañana')).toEqual('manana');
        expect(Str.slug('It\'s always sunny in philadelphia')).toEqual('its-always-sunny-in-philadelphia');
    });

});
