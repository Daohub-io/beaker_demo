<template>
  <div class="new_instance">
    <b-container>
      <b-row>
        <b-col>
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
      </b-row>
    </b-container>
  </div>
</template>

<script <script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import * as Store from "vuex-class";

import Navbar from "@/components/Navbar.vue";
import {
  web3,
  TestAbi,
  MIN_GAS,
  MIN_GAS_PRICE,
  ProcedureTable,
  WriteCap,
  LogCap,
  CallCap,
  Capability,
  CapabilityType
} from "@/web3";
import { Network, actions } from "@/store/modules/network";
import { ActionMethod, Action } from "vuex";
import Contract from "web3/eth/contract";

@Component({
  components: { Navbar }
})
export default class NewInstance extends Vue {
  @Store.State network: Network;
  @Store.Action("network/deploy_instance") deployInstance: (account?: string) => Promise<void>;

  newInstance = {
    name: "",
    account: "",
    entry_proc_address: "",
    entry_test_choice: ""
  };

  entry_tests = TestAbi;
  instance: Contract;

  procedures: { id: string; address: string }[] = [];
  state: Capability[] = [];

  async createInstance() {
    let account = this.newInstance.account;
    await this.deployInstance(account);

    let instances = this.network.instances;
    this.instance = instances[instances.length - 1].contract;
    let entry_code = this.newInstance.entry_test_choice;

    let name = web3.utils.toHex("Entry");
    const cap1 = new WriteCap(0x8000, 2);
    const cap2 = new LogCap([]);
    const cap3 = new CallCap();
    const caps = Capability.toInput([cap1, cap2, cap3]);

    let { procedureAddress } = await this.instance.methods
      .createProcedure(name, entry_code, caps)
      .call({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE });
    let tx1 = await this.instance.methods
      .createProcedure(name, entry_code, caps)
      .send({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE });

    this.$router.push({
      name: "instance",
      params: {
          instance_address: this.instance.options.address
      } 
    });
  }

  get accounts() {
    let accounts: Network["accounts"] = this.network.accounts;
    return accounts.map(({ id }) => id);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login form {
}
</style>