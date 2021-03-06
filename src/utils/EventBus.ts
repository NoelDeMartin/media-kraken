import Vue from 'vue';

export class EventBus {

    private bus = new Vue();

    public on(event: string, callback: Function): void {
        this.bus.$on(event, callback);
    }

    public off(event: string, callback: Function): void {
        this.bus.$off(event, callback);
    }

    public once(event: string, callback: Function): void {
        this.bus.$once(event, callback);
    }

    public emit(event: string, payload?: any): void {
        this.bus.$emit(event, payload);
    }

    public until(event: string): Promise<void> {
        return new Promise(resolve => this.once(event, resolve));
    }

}

export default new EventBus();
