import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/components/Login'
import CreateOrg from '@/components/CreateOrg'
import ListOrg from '@/components/ListOrg'
import ViewOrg from '@/components/ViewOrg'

import OrgStorage from '@/components/org/Storage.vue'
import OrgFile from '@/components/org/File.vue'
import OrgProcedures from '@/components/org/Procedures.vue'
import OrgProcedure from '@/components/org/Procedure.vue'
import OrgOrders from '@/components/org/Orders.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      component: Login
    },
    {
      path: '/org/create',
      component: CreateOrg
    },
    {
      path: '/org/list',
      component: ListOrg
    },
    {
      path: '/org/:id',
      component: ViewOrg,
      children : [
        {
          path: '',
          name: 'k_storage',
          component: OrgStorage
        },
        {
          name: 'k_table',
          path: 'file/:fileId',
          component: OrgFile
        },
        {
          name: 'k_procedures',
          path: 'procedures',
          component: OrgProcedures
        },
        {
          name: 'k_procedure',
          path: 'procedure/:procedureId',
          component: OrgProcedure
        },
        {
          name: 'k_orders',
          path: 'actions',
          component: OrgOrders
        }
      ]
    }
  ]
})
