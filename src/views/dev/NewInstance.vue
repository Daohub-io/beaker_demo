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
              <b-form-input id="name" type="text" v-model="newInstance.name" placeholder=""/>
            </b-form-group>
            <b-form-group label="Account" label-for="account">
              <b-form-select v-model="newInstance.account" :options="accounts">
                <option value="" disabled> Please Select Account</option>
              </b-form-select>
            </b-form-group>
            <b-form-group label="Sample Procedure" label-for="entry_proc_address">
              <b-form-select v-model="newInstance.test_choice">
                <option value="" disabled> Please Select Test Entry</option>
                <optgroup label="Procedure Object Capabilities">
                  <option :value="entry_tests.proc.call">Call Procedure</option>
                </optgroup>
                <optgroup label="Storage Object Capabilities">
                  <option :value="entry_tests.store.write">Write to Storage</option>
                </optgroup>
                <optgroup label="Log Object Capabilities">
                  <option :value="entry_tests.log.write">Write to Log</option>
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
import { Network, actions} from "@/store/modules/network";
import { ActionMethod, Action } from "vuex";
import Contract from "web3/eth/contract";import { ABIDefinition } from 'web3/eth/abi';

@Component({
  components: { Navbar }
})
export default class NewInstance extends Vue {
  @Store.State network: Network;
  @Store.Action("network/deploy_instance") deployInstance: (account?: string) => Promise<void>;
  @Store.Action("network/deploy_procedure") deployProcedure: (proc: {name: string, abi: any}) => Promise<void>;
  @Store.Action("network/register_procedure") registerProcedure: (proc: {name: string, address: string, caps: Capability[]}) => Promise<void>
  
  newInstance = {
    name: "",
    account: "",
    proc_address: "",
    test_choice: {}
  };

  entry_tests = TestAbi;
  instance: Contract;

  procedures: { id: string; address: string }[] = [];
  state: Capability[] = [];
  
  async createInstance() {
    let account = this.newInstance.account;
    await this.deployInstance(account);

    this.instance = this.network.instance.contract;

    let entry_code = this.newInstance.test_choice;
    let name = this.newInstance.name

    await this.deployProcedure({
      name,
      abi: this.newInstance.test_choice
    })
    
    let procedures = this.network.procedures;
    let procedure = procedures[procedures.length - 1];

    const cap1 = new WriteCap(0x8500, 2);
    const cap2 = new WriteCap(0x8000, 2);

    await this.registerProcedure({
      name,
      address: procedure.contract.options.address,
      caps: [cap1, cap2]
    })

    this.$router.push({
      name: "instance",
      params: {
          instance_address: this.instance.options.address
      } 
    });
  }

  async getAbi(address: string): Promise<ABIDefinition[]> {
    let opcode = await web3.eth.getCode(address)
    return [TestAbi.proc.call, TestAbi.store.write, TestAbi.log.write, TestAbi.entry].find(
      abi => abi.deployedBytecode === opcode
    ).abi
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