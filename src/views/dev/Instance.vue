<template>
  <div class="instance">
    <b-container>
      <b-row>
        <b-col>
          <b-input-group>
            <b-form-input v-model="new_address" type="text">
            </b-form-input>
            <b-input-group-append>
              <b-btn variant="primary" @click="update(new_address)">Update</b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-card header="Interface">
              <b-input-group v-for="call in interface" class="abi_call">
                <b-input-group-text slot="prepend">
                  {{ call.proc_id }}
                </b-input-group-text>
                <b-input-group-text slot="prepend" v-if="call.fn.name">
                  {{ call.fn.name }}
                </b-input-group-text>
                <b-form-input id="call" v-for="input in call.fn.inputs" :key="input.name" :placeholder="input.type" v-if="call.fn.inputs.length > 0"></b-form-input>
                <b-form-input v-if="call.fn.type === 'fallback'" placeholder="Fallback" disabled></b-form-input>
                <b-input-group-append>
                  <b-btn variant="primary" @click="makeCall(call.proc_i, call.id)" @mouseover="highlight = call.proc_id" @mouseout="highlight = ''">Call</b-btn>
                </b-input-group-append>
              </b-input-group>
          </b-card>
        </b-col>
        <b-col>
          <b-card no-body>
            <div slot="header" class="d-flex justify-content-between"> Procedures <b-button size="sm" class="clear-button" v-b-modal.modal1>+</b-button></div>
            <b-modal id="modal1" title="Create Procedure" @ok="createProc" @shown="clearCreateProc">
              <b-form>
                <b-form-group>
                  <b-form-input placeholder="Enter Address" v-model="newProc.address"></b-form-input>
                  <b-form-input placeholder="Enter Bytecode" v-model="newProc.bytecode"></b-form-input>
                  <b-form-input placeholder="Enter Abi" v-model="newProc.abi"></b-form-input>
                  <b-form-input placeholder="Capabilities" v-model="newProc.caps"></b-form-input>
                </b-form-group>
              </b-form>
            </b-modal>
            <b-list-group flush>
              <b-list-group-item v-for="(proc, i) in procedures" class="flex-column align-items-start" v-bind:class="{highlight: highlight === proc.id}">
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
                </b-input-group>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
        <b-col class="resources" tag="ul">
          <b-card no-body tag="li">
            <div slot="header" class="d-flex justify-content-between"> Storage <b-button size="sm" class="clear-button">+</b-button></div>
            <b-list-group flush>
              <b-list-group-item v-for="(store, i) in storage_caps" class="d-flex flex-column align-items-start" :key="i" v-bind:class="{lowhighlight: store.owners.includes(highlight)}">
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
        </b-col>
        <b-col>
          <b-card no-body v-if="log_caps.length > 0" tag="li">
            <div slot="header" class="d-flex justify-content-between"> Logs <b-button size="sm" class="clear-button">+</b-button></div>
            <b-list-group flush>
              <b-list-group-item v-for="(log, i) in log_caps" :key="i" class="d-flex flex-column align-items-start" v-bind:class="{lowhighlight: log.owners.includes(highlight)}">
                <div class="d-flex w-50 flex-column">
                  <small v-for="owner in log.owners">{{ owner }}</small>
                </div>
                <b-card no-body class="w-100" v-if="log.topics.length > 0">
                  <b-list-group flush>
                    <b-list-group-item v-for="(topic, i) in log.topics" :key="i" class="d-flex justify-content-between">
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
  CapabilityType,
LocalKernelAbi
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
  @Store.Action("network/update_instance") updateInstance: (instance?: {account?: string, address?: string}) => Promise<void>;
  @Store.Action("network/send_call") sendCall: (call: {proc_name: string, abi: ABIDefinition, instance: Contract}) => Promise<void>
  @Store.Action("network/deploy_procedure") deployProcedure: (proc: {name: string, abi: any}) => Promise<void>;
  @Store.Action("network/register_procedure") registerProcedure: (proc: {address: string, caps: Capability[] }) => Promise<void>
  
  instance_address: string;
  new_address: string = '';

  highlight: string = '';

  newCall = {
    abi_id: 0,
    input: []
  };

  newProc = {
    address: '',
    bytecode: '',
    abi: '',
    caps: [],
  }

  entry_fn: { text: string; value: number }[] = [];

  procedures: { id: string; address: string, abi: ABIDefinition[], owners: string[] }[] = [];
  caps: (WriteCap | CallCap | LogCap)[] = [];

  async mounted() {
    await this.updateProcedureTable();
    await this.updateCapTable();
    this.new_address = this.instance_address;
  }

   async update(address?: string) {
    await this.updateInstance({address})
    await this.updateCapTable();
    await this.updateProcedureTable();
  }

  async createProc() {

    if (this.newProc.address) {
      await this.registerProcedure({
        address: this.newProc.address,
        caps: this.newProc.caps,
      })
      return;
    } 

    if (this.newProc.abi) {
      await this.deployProcedure({
        name,
        abi: JSON.parse(this.newProc.abi)
      })

      let procedures = this.network.procedures;
      let procedure = procedures[procedures.length - 1];

      await this.registerProcedure({
        address: procedure.contract.options.address,
        caps: this.newProc.caps
      })
    }

    await this.update();
  }

  clearCreateProc() {
    this.newProc = { address: '', bytecode: '', abi: '', caps: []};
  }

  async makeCall(proc_id: number, abi_id: number) {
    let proc = this.procedures[proc_id]
    let abi = proc.abi[abi_id]
    
    await this.sendCall({
      proc_name: proc.id,
      abi,
      instance: this.instance,
    })

    await this.updateInstance()
    await this.updateCapTable();
    await this.updateProcedureTable();
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
        let owners = Array.from(this.getProcCallers(id))
        return { id, address, abi, owners };
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

    this.caps = result as any;
  }

  getProcCallers(id: string) {
    let callers: Set<string> = new Set();
    this.caps.forEach(cap => {
      if (cap instanceof CallCap) {
        if (cap.keys.length == 0 || (cap.keys as any).includes(id)) {
          cap.owners.forEach(owner => callers.add(owner))
        }
      }
    })
    return callers;
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

  get interface() {
    return this.procedures.reduce((res, proc, proc_i) => {
      return res.concat(proc.abi.map((fn, id) => ({ id, proc_i, proc_id: proc.id, fn })).filter(x => x.fn.type !== 'fallback'))
    }, [] as {fn: ABIDefinition, proc_i: number, id: number, proc_id: string}[])
  }
  get storage_caps(): WriteCap[] {
    return this.caps.filter(cap => cap.type === CapabilityType.StorageWrite) as WriteCap[]
  }

  get log_caps(): LogCap[] {
    return this.caps.filter(cap => cap.type === CapabilityType.LogWrite) as LogCap[]
  }

  get instance(): Contract {
    return this.network.instance.contract
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
.highlight {
  color: #fff;
  background-color:rgb(107, 107, 107);
}
.lowhighlight {
  background-color: #aaa;
}
.resources li {
  margin-bottom: 2rem;
}

.clear-button {
  padding: 0 5px;
  background-color: transparent;
  color: #333;
}
</style>