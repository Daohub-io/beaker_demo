<template>
  <div class="instance">
    <b-container>
      <b-row>
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

@Component<Instance>({
  props: {
    instance_address: String,
  }
})
export default class Instance extends Vue {
  @Store.State network: Network;
  @Store.Action("network/update_instance") updateInstance: (address: string) => Promise<void>;

  instance_address: string
  
  newInstance = {
    name: "",
    account: "",
    entry_proc_address: "",
    entry_test_choice: ""
  };

  procedures: { id: string; address: string }[] = [];
  caps: Capability[] = [];

  async mounted() {
    await this.updateProcedureTable()
    await this.updateCapTable()
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

  getCapTypeName(num: CapabilityType) {
    switch(num) {
      case CapabilityType.ProcedureCall: return "Procedure Call"
      case CapabilityType.StorageWrite: return "Storage Write"
      case CapabilityType.LogWrite: return "Log Write"
      default: "Unknown"
    }
  }

  get instance(): Contract {
    let addr = this.instance_address;
    return this.network.instances.find(inst => inst.contract.options.address === addr)!.contract
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login form {
}
</style>