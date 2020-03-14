export interface DebouncedFunction {
    call(...args: any[]): void;
    resolve(...args: any[]): void;
    cancel(): void;
}

class Time {

    public debounce(callback: Function, delay: number): DebouncedFunction {
        let timeout: NodeJS.Timeout | null = null;

        return {
            call(...args: any[]) {
                this.cancel();

                timeout = setTimeout(() => this.resolve(...args), delay);
            },
            resolve(...args: any[]) {
                timeout = null;

                callback(...args);
            },
            cancel() {
                if (timeout === null)
                    return;

                clearTimeout(timeout);
                timeout = null;
            },
        };
    }

    public isValidDateString(value: string): boolean {
        const date = new Date(value);

        return !isNaN(date.getTime());
    }

}

export default new Time();
