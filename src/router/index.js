import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import Login from '@/components/Login'
import Explore from '@/components/Explore'

import Contract from '@/components/Contract'
import ContractState from '@/components/contract/State'
import ContractRequests from '@/components/contract/Requests'
import ContractActors from '@/components/contract/Actors'
import ContractTx from '@/components/contract/Transactions'
import ContractMetrics from '@/components/contract/Metrics'
import ContractNetwork from '@/components/contract/Network'
import ContractSettings from '@/components/contract/Settings'


import Account from '@/components/Account'
import NewProject from '@/components/NewProject'

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
