import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue'

import router from '@/router';
import store from '@/store/index'

import App from '@/components/App.vue';

Vue.use(BootstrapVue)

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
