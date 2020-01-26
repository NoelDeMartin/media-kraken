import Auth from '@/services/Auth';
import Media from '@/services/Media';

declare module 'vue/types/vue' {

    interface Vue {
        $auth: Auth;
        $media: Media;
    }

    interface VueConstructor<V extends Vue = Vue> {
        instance: Vue;
    }

}
