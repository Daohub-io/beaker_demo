import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex)

import * as account from '@/store/modules/account'
import * as network from '@/store/modules/network'
import * as project from '@/store/modules/project'

export default new Vuex.Store({ modules: {account, network, project }})