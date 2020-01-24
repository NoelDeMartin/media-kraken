import Media from '@/services/Media';

declare module 'vue/types/vue' {

    interface Vue {
        $media: Media;
    }

    interface VueConstructor<V extends Vue = Vue> {
        instance: Vue;
    }

}
