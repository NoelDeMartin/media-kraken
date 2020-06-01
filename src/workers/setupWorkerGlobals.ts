import { setUpPolyfills } from '@/utils/polyfills';

(global as any).window = global;

setUpPolyfills(global);
