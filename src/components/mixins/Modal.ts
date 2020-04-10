import mixins from 'vue-typed-mixins';
import Vue from 'vue';

import { ModalOptions } from '@/services/UI';

import AppModal from '@/components/AppModal.vue';

export default mixins(Vue.extend({
    components: {
        AppModal,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        options: {
            type: Object as () => ModalOptions,
            required: true,
        },
    },
    methods: {
        close(force: boolean = false) {
            this.$ui.closeModal(this.id, force);
        },
    },
}));
