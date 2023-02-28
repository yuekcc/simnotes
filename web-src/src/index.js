import { createApp, h } from 'vue';

const Root = {
  render() {
    return h('div', null, 'hello');
  },
};

createApp(Root).mount('#app');
