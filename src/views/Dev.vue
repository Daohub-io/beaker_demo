<template>
  <div class="dev">
    <Navbar>
      <template slot="context">
        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <b-btn v-b-modal.modalConnection size="sm" :variant="connected ? 'success': 'danger'">{{ connected ? 'Connected': 'No Connection'}}</b-btn>
            <b-modal id="modalConnection" ref="modal" title="Set Connection" @ok="handleOk">
              <form @submit.stop.prevent="handleOk">
                <p>Network Id: {{ network.node.id }}</p>
                <p>Type: {{ network.node.type }} </p>
                <b-form-input type="text" placeholder="Enter Node Address" v-model="address"></b-form-input>
              </form>
            </b-modal>
          </b-nav-form>
        </b-navbar-nav>
      </template>
    </Navbar>
    <b-container>
      <b-row>
          <b-col cols="3" align="center">
            Development
            
          </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import * as Store from 'vuex-class'

import Navbar from "@/components/Navbar.vue";
import { web3 } from "@/web3";
import { Network, actions  } from '@/store/modules/network';
import { ActionMethod, Action } from 'vuex';

@Component({
  components: { Navbar }
})
export default class Dev extends Vue {

  @Store.State network: Network
  @Store.Action('network/connect') connect: () => Promise<void>;

  address = "";
  
  mounted() {
    this.connect();
  }

  async handleOk() {
    await this.connect();
  }

  get connected() {
    return this.network.accounts.length !== 0;
  }
  get version() {
    return web3.version 
  }

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dev {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
