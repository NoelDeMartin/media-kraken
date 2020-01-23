import '';

declare module 'vue/types/vue' {

    interface VueConstructor<V extends Vue = Vue> {
        instance: Vue;
    }

}
