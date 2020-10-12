import Str from './Str';

describe('String utils', () => {

    it('removes accents from slugs', () => {
        expect(Str.slug('Sin perdón')).toEqual('sin-perdon');
        expect(Str.slug('Mañana')).toEqual('manana');
        expect(Str.slug('It\'s always sunny in philadelphia')).toEqual('its-always-sunny-in-philadelphia');
    });

    it('parses versions', () => {
        expect(Str.parseVersion('0.1.1')).toEqual([0, 1, 1]);
        expect(Str.parseVersion('1.0.0-beta')).toEqual([1, 0, 0, 'beta']);
        expect(Str.parseVersion('0.23.0')).toEqual([0, 23, 0]);
        expect(Str.parseVersion('foobar')).toEqual(null);
    });

});
