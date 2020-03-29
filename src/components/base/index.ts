import Vue from 'vue';

const requireComponent = require.context('@/components/base', false, /\.vue$/);

for (const fileName of requireComponent.keys()) {
    const name = fileName.match(/^(?:\.\/)?(.+)\.vue$/)![1];

    if (typeof name !== 'undefined')
        Vue.component(name, requireComponent(fileName).default);
}
