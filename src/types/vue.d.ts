import Auth from '@/services/Auth';
import Config from '@/services/Config';
import Media from '@/services/Media';
import Search from '@/services/Search';

declare module 'vue/types/vue' {

    interface Vue {
        $auth: Auth;
        $config: Config;
        $media: Media;
        $search: Search;
    }

    interface VueConstructor<V extends Vue = Vue> {
        instance: Vue;
    }

}
