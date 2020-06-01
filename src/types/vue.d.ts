import Auth from '@/services/Auth';
import Config from '@/services/Config';
import Media from '@/services/Media';
import Search from '@/services/Search';
import UI from '@/services/UI';

declare module 'vue/types/vue' {

    interface Vue {
        $auth: Auth;
        $config: Config;
        $media: Media;
        $search: Search;
        $ui: UI;
    }

    interface VueConstructor<V extends Vue = Vue> {
        instance: Vue;
    }

}
