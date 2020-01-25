import Vue from 'vue';

const components = require.context('@/components/base', false, /\.vue$/);

for (const fileName of components.keys()) {
    const name = fileName.match(/^(?:\.\/)?(.+)\.vue$/)![1];

    if (typeof name !== 'undefined')
        Vue.component(name, components(fileName).default);
}
