import Vue from 'vue';
import App from './App.vue';
import router from './router';

import BootstrapVue from 'bootstrap-vue'
import State from '@/state/index'
import Web3 from '@/web3/index'

Vue.use(BootstrapVue)
Vue.use(State)
Vue.use(Web3)

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
