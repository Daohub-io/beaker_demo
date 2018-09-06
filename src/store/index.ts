import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex)

import {account} from '@/store/modules/account'
import {network} from '@/store/modules/network'
import {project} from '@/store/modules/project'

export default new Vuex.Store({ modules: {account, network, project }})