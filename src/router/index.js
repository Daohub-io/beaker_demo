import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import Login from '@/components/Login'
import Explore from '@/components/Explore'
import Instance from '@/components/Instance'

import Org from '@/components/Org'

import OrgStorage from '@/components/org/Storage.vue'
import OrgFile from '@/components/org/File.vue'
import OrgProcedures from '@/components/org/Procedures.vue'
import OrgProcedure from '@/components/org/Procedure.vue'
import OrgOrders from '@/components/org/Orders.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/:org',
      children: [
        {
          path: '',
          component: Org,
        },
        {
          path: '/:instance',
          component: Instance
        }
      ]
    },
    {
      path: '/explore',
      component: Explore
    }
  ]
})
