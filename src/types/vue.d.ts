import App from '@/services/App';
import Auth from '@/services/Auth';
import Browser from '@/services/Browser';
import Media from '@/services/Media';
import Search from '@/services/Search';
import UI from '@/services/UI';

declare module 'vue/types/vue' {

    interface Vue {
        $app: App;
        $auth: Auth;
        $browser: Browser;
        $media: Media;
        $search: Search;
        $ui: UI;
    }

    interface VueConstructor<V extends Vue = Vue> {
        instance: Vue;
    }

}
