(global as any).window = global;
(global as any).setImmediate = (callback: Function, ...params: any[]) => setTimeout(() => callback(...params), 0);
(global as any).clearImmediate = (callback: Function, ...params: any[]) => setTimeout(() => callback(...params), 0);
