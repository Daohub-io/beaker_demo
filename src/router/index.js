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


import User from '@/components/User'
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
      name: 'contract',
      component: Contract,
      children: [
        {
          path: '',
          name: 'contract-state',
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
        }
      ]
    },
    {
      path: '/:user',
      component: User,
    },
    {
      path: '/explore',
      component: Explore
    }
  ]
})
