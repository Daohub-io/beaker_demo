import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import Login from '@/components/Login'
import Explore from '@/components/Explore'
import Contract from '@/components/Contract'

import User from '@/components/User'
import NewProject from '@/components/NewProject'

Vue.use(Router)

export default new Router({
  mode: 'history',
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
      component: Contract
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
