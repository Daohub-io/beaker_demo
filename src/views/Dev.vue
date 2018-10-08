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
                <b-form-input type="text" placeholder="Enter Node Address" v-model="network.address"></b-form-input>
              </form>
            </b-modal>
          </b-nav-form>
        </b-navbar-nav>
      </template>
    </Navbar>
    <b-container>
      <b-row>
        <b-col cols="4">
          <header>
            <h3>New Instance</h3>
            <p>Deploy a new Kernel Instance</p>
          </header>
          <b-form>
            <b-form-group label="Name" label-for="name">
              <b-form-input id="name" type="text" :value ="newInstance.name" placeholder=""/>
            </b-form-group>
            <b-form-group label="Account" label-for="account">
              <b-form-select v-model="newInstance.account" :options="accounts">
                <option value="" disabled> Please Select Account</option>
              </b-form-select>
            </b-form-group>
            <b-form-group label="Entry Procedure" label-for="entry_proc_address">
              <b-form-select v-model="newInstance.entry_test_choice">
                <option value="" disabled> Please Select Test Entry</option>
                <optgroup label="Procedure Object Capabilities">
                  <option :value="entry_tests.proc.call.bytecode">Call Procedure</option>
                </optgroup>
                <optgroup label="Storage Object Capabilities">
                  <option :value="entry_tests.store.write.bytecode">Write to Storage</option>
                </optgroup>
                <optgroup label="Log Object Capabilities">
                  <option :value="entry_tests.log.write.bytecode">Write to Log</option>
                </optgroup>
              </b-form-select>
            </b-form-group>
            <b-button variant="primary" @click="createInstance">Create</b-button>
            <b-button type="reset" variant="danger">Reset</b-button>
          </b-form>
        </b-col>
        <b-col cols="8">
          <h3>Procedures</h3>
          <b-table :items="procedures"></b-table>
          <h3>State</h3>
          <b-table :items="state"></b-table>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import * as Store from "vuex-class";

import Navbar from "@/components/Navbar.vue";
import { web3, TestAbi, MIN_GAS, MIN_GAS_PRICE, ProcedureTable, WriteCap, LogCap, CallCap, Capability } from "@/web3";
import { Network, actions } from "@/store/modules/network";
import { ActionMethod, Action } from "vuex";
import Contract from 'web3/eth/contract';

@Component({
  components: { Navbar }
})
export default class Dev extends Vue {
  @Store.State network: Network;
  @Store.Action("network/connect") connect: () => Promise<void>;
  @Store.Action("network/deploy_instance") deployInstance: (account?: string) => Promise<void>

  newInstance = {
    name: "",
    account: "",
    entry_proc_address: "",
    entry_test_choice: "",
  }

  entry_tests = TestAbi;

  instance: Contract;

  procedures: {id: string, address: string}[] = [];
  state: {owner: string, size: number}[] = [];

  mounted() {
    this.connect();
  }

  async createInstance() {
    let account = this.newInstance.account
    await this.deployInstance(account);

    let instances = this.network.instances;
    this.instance = instances[instances.length -1]
    let entry_code = this.newInstance.entry_test_choice

    let name = web3.utils.toHex("Entry")
    const cap1 = new WriteCap(0x8000, 2);
    const cap2 = new LogCap([]);
    const cap3 = new CallCap();
    const caps = Capability.toInput([cap1, cap2, cap3]);

    let { procedureAddress } = await this.instance.methods.createProcedure(name, entry_code, caps).call({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE});
    let tx1 = await this.instance.methods.createProcedure(name, entry_code, caps).send({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE});

    this.procedures.push({id: "Entry", address: procedureAddress })
    await this.updateProcedureTable()
    await this.updateStorageTable()
  }

  async getProcedureAddress(id: string, account: string) {
    let name = web3.utils.isHex(id) ? id : web3.utils.toHex(id);
    return this.instance.methods.getProcedure(name).call();
  }

  async updateProcedureTable() {
    const account = this.newInstance.account

    const procedures: [string] = await this.instance.methods.listProcedures().call();

    this.procedures = await Promise.all(procedures.map(async hex_id => {
      let id = web3.utils.hexToUtf8(hex_id)
      let address = await this.instance.methods.getProcedure(hex_id).call();
      return {id, address}
    }))
  }

  async updateStorageTable() {
    let raw_proc_table = await this.instance.methods.returnProcedureTable().call();
    let proc_table = ProcedureTable.parse(raw_proc_table)
    console.log(proc_table)
    return proc_table.table
  }

  async handleOk() {
    await this.connect();
  }

  get connected() {
    return this.network.accounts.length !== 0;
  }
  get version() {
    return web3.version;
  }

  get accounts() {
    let accounts: Network['accounts'] = this.network.accounts;
    return accounts.map(({id}) => id)
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dev {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

h3, h4 {
  margin-top: 1rem;
}
</style>
