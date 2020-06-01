export function setUpPolyfills(globalObject: any) {
    globalObject.setImmediate = (callback: Function, ...params: any[]) => setTimeout(() => callback(...params), 0);
    globalObject.clearImmediate = (callback: Function, ...params: any[]) => setTimeout(() => callback(...params), 0);
}
