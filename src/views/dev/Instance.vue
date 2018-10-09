<template>
  <div class="instance">
    <b-container>
      <b-row>
        <b-col cols="3">
          <b-form>
            <b-form-group label="Account" label-for="account">
              <b-form-select v-model="newCall.account" :options="accounts">
                <option value="" disabled> Please Select Account</option>
              </b-form-select>
            </b-form-group>
            <b-form-group label="Entry Procedure" label-for="call">
              <b-form-select id="call" v-model="newCall.abi_sig" :options="entry_fn">
                <option value="" disabled> Please Select Test Entry</option>
              </b-form-select>
            </b-form-group>
            <b-button variant="primary" >Create</b-button>
            <b-button type="reset" variant="danger">Reset</b-button>
          </b-form>
        </b-col>
        <b-col>
          <h3>Procedures</h3>
          <b-table :items="procedures"></b-table>
          <h3>State</h3>
          <b-table :items="caps">
            <template slot="type" slot-scope="data">
              {{getCapTypeName(data.value)}}
            </template>
          </b-table>
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
import ABI,{ ABIDefinition } from 'web3/eth/abi';

@Component<Instance>({
  props: {
    instance_address: String,
  }
})
export default class Instance extends Vue {
  @Store.State network: Network;
  @Store.Action("network/update_instance") updateInstance: (address: string) => Promise<void>;

  instance_address: string
  
  newCall = {
    account: "",
    abi_sig: "",
    input: [],
  }

  entry_abi: ABIDefinition[] = [];
  entry_fn: { text: string, value: number }[] = [];

  procedures: { id: string; address: string }[] = [];
  caps: Capability[] = [];
  
  async mounted() {
    await this.updateProcedureTable()
    await this.updateCapTable()

    this.entry_abi = await this.getEntryAbi()
    this.entry_fn = this.getAbiFunctions(this.entry_abi)
  }

  async getProcedureAddress(id: string, account: string) {
    let name = web3.utils.isHex(id) ? id : web3.utils.toHex(id);
    return this.instance.methods.getProcedure(name).call();
  }

  async updateProcedureTable() {
    const procedures: [string] = await this.instance.methods.listProcedures().call();

    this.procedures = await Promise.all(
      procedures.map(async hex_id => {
        let id = web3.utils.hexToUtf8(hex_id);
        let address = await this.instance.methods.getProcedure(hex_id).call();
        return { id, address };
      })
    );
  }

  async updateCapTable() {
    let raw_proc_table = await this.instance.methods
      .returnProcedureTable()
      .call();
    let proc_table = ProcedureTable.parse(raw_proc_table).table;

    let result: Capability[] = [];
    
    for (let key in proc_table) {
      let proc = proc_table[key];

      proc.caps.forEach(cap => {
          // Set Key as Ascii
          let name = web3.utils.hexToUtf8(key)
          // Add Owner to Cap
          cap.owners.push(name)

          let dup_i = result.findIndex(p_cap => cap.type === p_cap.type && cap.raw_values === p_cap.raw_values);
          // If a Duplicate Cap is found, add Proc to Owners, if not add to results.
          if (dup_i !== -1) {
            result[dup_i].owners.push(name)
          } else {
            result.push(cap)
          }
      })
    }

    this.caps = result;
  }

  async getEntryAbi(): Promise<ABIDefinition[]> {
    let entry_opcode = await web3.eth.getCode(this.procedures[0].address)
    return [TestAbi.proc.call, TestAbi.store.write, TestAbi.log.write].find(abi => abi.deployedBytecode === entry_opcode).abi;
  }

  getCapTypeName(num: CapabilityType) {
    switch(num) {
      case CapabilityType.ProcedureCall: return "Procedure Call"
      case CapabilityType.StorageWrite: return "Storage Write"
      case CapabilityType.LogWrite: return "Log Write"
      default: "Unknown"
    }
  }

  getAbiFunctions(abi: ABIDefinition[]) {
    return abi.map((fn, id) => {
      let name = fn.type === "fallback" ? 'fallback' : fn.name;
      let inputs = !(fn.inputs) ? '': fn.inputs.map(input => input.type+ ' '+input.name).join(',')
      let outputs = !(fn.outputs) || fn.outputs.length === 0 ? '': '-> ' + fn.outputs.map(output => output.type).join(',')
      return {
        value: id,
        text: `${name}(${inputs})${outputs}`
      }
    })
  }

  get instance(): Contract {
    let addr = this.instance_address;
    return this.network.instances.find(inst => inst.contract.options.address === addr)!.contract
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