import Vue from 'vue'
import Router from 'vue-router'

import NotFound from '@/views/NotFound.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'

import Contract from '@/views/Contract.vue'
import ContractState from '@/views/contract/State.vue'
import ContractStateTree from '@/views/contract/state/Tree.vue'
import ContractStateBlob from '@/views/contract/state/Blob.vue'

import ContractTxList from '@/views/contract/TxList.vue'
import ContractTx from '@/views/contract/tx/Transaction.vue'

import ContractActors from '@/views/contract/Actors.vue'
import ContractMetrics from '@/views/contract/Metrics.vue'
import ContractNetwork from '@/views/contract/Network.vue'
import ContractSettings from '@/views/contract/Settings.vue'

import Account from '@/views/Account.vue'
import NewProject from '@/views/NewProject.vue'

import Dev from '@/views/Dev.vue'
import NewInstance from '@/views/dev/NewInstance.vue'
import Instance from '@/views/dev/Instance.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/home',
      component: Home
    },
    {
      path: '',
      component: Dev,
      children: [
        {
          path: '',
          name: 'new',
          component: NewInstance
        },
        {
          path: 'instance/:instance_address',
          name: 'instance',
          component: Instance,
          props: true
        }
      ]
    },
    {
      path: '/404',
      component: NotFound
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/projects/new',
      component: NewProject
    },
    {
      path: '/:owner/:contract',
      component: Contract,
      children: [
        {
          path: '',
          name: 'contract',
          component: ContractState
        },
        {
          path: 'tree/:block/(.*)',
          name: 'contract-state-tree',
          component: ContractStateTree
        },
        {
          path: 'blob/:block/(.*)',
          name: 'contract-state-blob',
          component: ContractStateBlob
        },
        {
          path: 'tx',
          name: 'contract-transactions',
          component: ContractTxList
        },
        {
          path: 'tx/:hash',
          name: 'contract-transaction',
          component: ContractTx
        },
        {
          path: 'actors',
          name: 'contract-actors',
          component: ContractActors
        },
        {
          path: 'metrics',
          name: 'contract-metrics',
          component: ContractMetrics
        },
        {
          path: 'network',
          name: 'contract-network',
          component: ContractNetwork
        },
        {
          path: 'settings',
          name: 'contract-settings',
          component: ContractSettings
        }
      ]
    },
    {
      path: '/:account',
      name: 'account',
      component: Account,
    }
  ]
})
