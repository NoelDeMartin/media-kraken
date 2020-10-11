import { Services } from '@/services';

declare module 'vue/types/vue' {

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Vue extends Services {
        //
    }

    interface VueConstructor<V extends Vue = Vue> {
        instance: Vue;
    }

}
