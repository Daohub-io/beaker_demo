import { Module, MutationTree, ActionTree } from 'vuex/types'

import { web3, LocalKernelAbi, MIN_GAS, MIN_GAS_PRICE, DEFAULT_PORT, DEFAULT_ADDRESS, ProcedureTable, TestAbi, Capability, WriteCap, LogCap, CallCap, installEntryProc, deployedTrimmed } from '@/web3/index'
import Contract from 'web3/eth/contract';
import Root from '@/store/modules/root'
import { ABIDefinition } from 'web3/eth/abi';

export interface Network {
    address: string;
    accounts: { id: string, balance: number }[];
    instances: { contract: Contract, proc_table?: ProcedureTable }[];
    procedures: { name: string, contract: Contract }[];
    isSyncing: boolean;
    node: { id: string, type: string };
}

export const namespaced = true;
export const state: Network = {
    address: DEFAULT_ADDRESS,
    accounts: [],
    instances: [],
    procedures: [],
    isSyncing: false,
    node: { id: '', type: '' }
}

export const mutations: MutationTree<Network> = {
    set_network(state: Network, address: string) {
        state.address = address
    },
    set_node(state: Network, node: { id: string, type: string }) {
        state.node = node;
    },
    set_accounts(state: Network, accounts: { id: string, balance: number }[]) {
        state.accounts = accounts;
    },
    add_instance(state: Network, kernel: Contract) {
        state.instances.push({ contract: kernel })
    },
    set_instance_proc_table(state: Network, new_state: { address: string, table: ProcedureTable }) {
        let i = state.instances.findIndex(({ contract }) => contract.options.address === new_state.address)
        if (i !== -1) state.instances[i].proc_table = new_state.table
    },
    add_procedure(state: Network, procedure: { contract: Contract, name: string }) {
        state.procedures.push(procedure)
    }
}

export const actions: ActionTree<Network, Root> = {
    async connect({ dispatch, commit }, address: string = DEFAULT_ADDRESS) {
        web3.setProvider(address as any)
        commit('set_node', { id: await web3.eth.net.getId(), type: await (web3.eth.net as any).getNetworkType() })

        // Get Accounts and Balance for Each
        let list = await web3.eth.getAccounts()
        let accounts: Network['accounts'] = await Promise.all(list.map(async id => ({
            id,
            balance: await web3.eth.getBalance(id)
        })));

        commit('set_accounts', accounts)
    },

    async deploy_instance({ dispatch, commit, state }, account: string = state.accounts[0].id, kernelAbi = LocalKernelAbi) {
        // Create New Kernel Contract in Memory
        const kernel = new web3.eth.Contract([kernelAbi])
        let instance = await kernel.deploy({ data: kernelAbi.bytecode } as any).send({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
        instance.options.jsonInterface = kernelAbi.abi;
        instance.options.from = account

        let name = web3.utils.toHex("Entry");
        let entryproc = await installEntryProc(instance, name, account)

        commit('add_instance', instance)
        commit('add_procedure', { contract: entryproc, name })
    },

    async deploy_procedure({ dispatch, commit, state }, proc: { name: string, abi: any }) {
        let name = web3.utils.toHex(proc.name);
        const contract = await deployedTrimmed(proc.abi, state.accounts[0].id);
        commit('add_procedure', { contract, name })
    },

    async register_procedure({ dispatch, commit, state }, proc: { address: string, caps: Capability[], instance_address: string }) {
        let instance = state.instances.find(({ contract }) => contract.options.address === proc.instance_address)
        if (!instance) throw 'No Instance with address: ' + proc.instance_address + ' found';

        let procedure = state.procedures.find(({ contract }) => contract.options.address === proc.address)
        if (!procedure) throw 'No Procedure with address: ' + proc.address + ' found';

        const caps = Capability.toInput(proc.caps);

        await instance.contract.methods.registerProcedure(procedure.name, proc.address, caps).send({ from: state.accounts[0].id, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
        await dispatch("update_instance", proc.instance_address)
    },

    async update_instance({ dispatch, commit, state }, address: string) {
        let instance = state.instances.find(({ contract }) => contract.options.address === address)
        if (!instance) throw 'No Instance with address: ' + address + ' found';

        let contract = instance.contract;
        const raw_procedures: [string] = await contract.methods.listProcedures().call();

        let table = await Promise.all(
            raw_procedures.map(async hex_id => {
                let id = web3.utils.hexToUtf8(hex_id);
                let address = await contract.methods.getProcedure(hex_id).call();
                return { id, address };
            })
        );

        commit('set_instance_proc_table', { address, table })
    },

    async send_call({ dispatch, commit, state }, call: {proc_name: string, abi: ABIDefinition, instance: Contract}) {
        let procedure = state.procedures.find(proc => proc.name === web3.utils.toHex(call.proc_name))
        if (!procedure) throw 'No Procedure with name: ' + call.proc_name + ' found';

        // Make the function selector (TODO: we aren't considering input at all
        // here)
        const functionSelectorHash = web3.utils.sha3(call.abi.name! + '()').slice(2, 10);
        // This platorm (typescript?) doesn't have String.padEnd(), so this does
        // the padding of the key name (ASCII padded out to 24 bytes with nulls)
        const paddedProcKey = (call.proc_name as any).padEnd(24, '\0');
        const inputData = web3.utils.fromAscii(paddedProcKey) + functionSelectorHash;

        let { address, from } = call.instance.options;

        // Use this err value for error checking
        const err = await web3.eth.call({ to: address, data: inputData, from });
        const tx = await web3.eth.sendTransaction({ gas: 300000, to: address, data: inputData, from });
    }
}