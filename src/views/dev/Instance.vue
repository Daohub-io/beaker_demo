<template>
  <div class="instance">
    <b-container>
      <b-row>
        <b-button @click="updateProcedureTable">Refresh</b-button>
      </b-row>
      <b-row>
        <b-col>
          <b-card no-body header="Procedure Table">
            <b-list-group flush>
              <b-list-group-item v-for="(proc, i) in procedures" class="flex-column align-items-start">
                <div class="d-flex w-50 flex-column">
                  <small>{{ proc.address.slice(0,10)+'...' }}</small>
                  <h5 class="mb-1">{{ proc.id }}</h5>
                </div>
                <b-input-group v-for="(abi, id) in proc.abi" class="abi_call">
                  <b-input-group-text slot="prepend" v-if="abi.name">
                    {{ abi.name }}
                  </b-input-group-text>
                  <b-form-input id="call" v-for="input in abi.inputs" :key="input.name" :placeholder="input.type"></b-form-input>
                  <b-form-input v-if="abi.type === 'fallback'" placeholder="Fallback" disabled></b-form-input>
                  <b-form-input v-else-if="abi.inputs.length == 0" placeholder="No Parameters" disabled></b-form-input>
                  <b-input-group-append>
                    <b-btn variant="primary" @click="makeCall(i, id)" >Call</b-btn>
                  </b-input-group-append>
                </b-input-group>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
        <b-col cols="3"></b-col>
        <b-col class="resources" tag="ul">
          <b-card no-body header="Storage" tag="li">
            <b-list-group flush>
              <b-list-group-item v-for="store in storage_caps" class="d-flex flex-column align-items-start">
                <div class="d-flex w-50 flex-column">
                  <small v-for="owner in store.owners">{{ owner }}</small>
                </div>
                <b-card no-body class="w-100">
                  <b-list-group flush>
                    <b-list-group-item v-for="(data, i) in store.data" class="d-flex justify-content-between">
                      <span>
                        {{ data }}
                      </span>
                      <small>
                        {{ store.address + i - 1}}
                      </small>
                    </b-list-group-item>
                  </b-list-group>
                </b-card>
              </b-list-group-item>
            </b-list-group>
          </b-card>
          <b-card no-body header="Logs" v-if="log_caps.length > 0" tag="li">
            <b-list-group flush>
              <b-list-group-item v-for="log in log_caps" class="d-flex flex-column align-items-start">
                <div class="d-flex w-50 flex-column">
                  <small v-for="owner in log.owners">{{ owner }}</small>
                </div>
                <b-card no-body class="w-100" v-if="log.topics.length > 0">
                  <b-list-group flush>
                    <b-list-group-item v-for="(topic, i) in log.topics" class="d-flex justify-content-between">
                      <span>
                        {{ topic }}
                      </span>
                      <small>
                        Position {{ i }}
                      </small>
                    </b-list-group-item>
                  </b-list-group>
                </b-card>
                <span v-else>
                  Any Topics
                </span>
              </b-list-group-item>
            </b-list-group>
          </b-card>
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
import ABI, { ABIDefinition } from "web3/eth/abi";

@Component<Instance>({
  props: {
    instance_address: String
  }
})
export default class Instance extends Vue {
  @Store.State network: Network;
  @Store.Action("network/update_instance") updateInstance: (address: string) => Promise<void>;

  instance_address: string;

  newCall = {
    abi_id: 0,
    input: []
  };

  entry_fn: { text: string; value: number }[] = [];

  procedures: { id: string; address: string, abi: ABIDefinition[] }[] = [];
  caps: Capability[] = [];

  async mounted() {
    await this.updateProcedureTable();
    await this.updateCapTable();

  }

  async makeCall(proc_id: number, abi_id: number) {
    let proc = this.procedures[proc_id]
    let abi = proc.abi[abi_id]

    const functionSelectorHash = web3.utils.sha3('A()').slice(2,10);
    const inputData = web3.utils.fromAscii((proc.id as any).padEnd(24,"\0")) + functionSelectorHash;

    let wrap = new web3.eth.Contract(proc.abi, this.instance.options.address, this.instance.options)
    let tx = await wrap.methods[abi.name!]().send({
      from: this.accounts[0],
      gas: MIN_GAS,
      gasPrice: MIN_GAS_PRICE
    });
    console.log(tx)

    // let err = await web3.eth.call({to: this.instance.options.address, data: inputData, from: this.instance.options.from });
    // let tx = await web3.eth.sendTransaction({to: this.instance.options.address, data: inputData, from: this.instance.options.from });

    await this.updateInstance(this.instance_address)
    await this.updateProcedureTable();
    await this.updateCapTable();
  }

  async getProcedureAddress(id: string, account: string) {
    let name = web3.utils.isHex(id) ? id : web3.utils.toHex(id);
    return this.instance.methods.getProcedure(name).call();
  }

  async updateProcedureTable() {
    const procedures: string[] = await this.instance.methods.listProcedures().call();
    this.procedures = await Promise.all(
      procedures.map(async hex_id => {
        let id = web3.utils.hexToUtf8(hex_id);
        let address = await this.instance.methods.getProcedure(hex_id).call();
        let abi = await this.getAbi(address)
        return { id, address, abi };
      })
    );
  }

  async updateCapTable() {
    let raw_proc_table = await this.instance.methods.returnProcedureTable().call();
    let proc_table = ProcedureTable.parse(raw_proc_table).table;

    let result: Capability[] = [];

    for (let key in proc_table) {
      let proc = proc_table[key];

      proc.caps.forEach(async cap => {
        // Set Key as Ascii
        let name = web3.utils.hexToUtf8(key);
        // Add Owner to Cap
        cap.owners.push(name);

        // If Storage Cap, populate data with storage values
        if(cap.type === CapabilityType.StorageWrite) {
          let { address, size} = cap as WriteCap;
          let data = Array.from({length: size}, (x,i) => web3.eth.getStorageAt(this.instance.options.address, address + i));
          cap.data = await Promise.all(data)
        }

        let dup_i = result.findIndex(
          p_cap =>
            cap.type === p_cap.type && cap.raw_values === p_cap.raw_values
        );
        // If a Duplicate Cap is found, add Proc to Owners, if not add to results.
        if (dup_i !== -1) {
          result[dup_i].owners.push(name);
        } else {
          result.push(cap);
        }
      });
    }

    this.caps = result;
  }

  getAbi(address: string): ABIDefinition[] {
    let proc = this.network.procedures.find(proc => proc.contract.options.address === address);
    return proc!.contract.options.jsonInterface
  }

  getCapTypeName(num: CapabilityType) {
    switch (num) {
      case CapabilityType.ProcedureCall:
        return "Procedure Call";
      case CapabilityType.StorageWrite:
        return "Storage Write";
      case CapabilityType.LogWrite:
        return "Log Write";
      default:
        "Unknown";
    }
  }

  getAbiFunctions(abi: ABIDefinition[]) {
    return abi.map((fn, id) => {
      let name = fn.type === "fallback" ? "fallback" : fn.name;
      let inputs = !fn.inputs
        ? ""
        : fn.inputs.map(input => input.type + " " + input.name).join(",");
      let outputs =
        !fn.outputs || fn.outputs.length === 0
          ? ""
          : "-> " + fn.outputs.map(output => output.type).join(",");
      return {
        value: id,
        text: `${name}(${inputs})${outputs}`
      };
    });
  }

  get storage_caps(): WriteCap[] {
    return this.caps.filter(cap => cap.type === CapabilityType.StorageWrite) as WriteCap[]
  }

  get log_caps(): LogCap[] {
    return this.caps.filter(cap => cap.type === CapabilityType.LogWrite) as LogCap[]
  }

  get instance(): Contract {
    let addr = this.instance_address;
    return this.network.instances.find(
      inst => inst.contract.options.address === addr
    )!.contract;
  }

  get accounts() {
    let accounts: Network["accounts"] = this.network.accounts;
    return accounts.map(({ id }) => id);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.instance {
  padding-top: 2rem;
}
.abi_call {
  margin-top: 0.5rem;
}

.resources li {
  margin-bottom: 2rem;
}
</style>