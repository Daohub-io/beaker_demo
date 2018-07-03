import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Login from '@/views/Login'
import Explore from '@/views/Explore'

import Contract from '@/views/Contract'
import ContractState from '@/views/contract/State'
import ContractRequests from '@/views/contract/Requests'
import ContractActors from '@/views/contract/Actors'
import ContractTx from '@/views/contract/Transactions'
import ContractMetrics from '@/views/contract/Metrics'
import ContractNetwork from '@/views/contract/Network'
import ContractSettings from '@/views/contract/Settings'

import Account from '@/views/Account'
import NewProject from '@/views/NewProject'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '',
      component: Home
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
          path: 'requests',
          name: 'contract-requests',
          component: ContractRequests
        },
        {
          path: 'actors',
          name: 'contract-actors',
          component: ContractActors
        },
        {
          path: 'tx',
          name: 'contract-tx',
          component: ContractTx
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
    },
    {
      path: '/explore',
      component: Explore
    }
  ]
})
