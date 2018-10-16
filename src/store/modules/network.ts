import { Module, MutationTree, ActionTree } from 'vuex/types'

import { web3, LocalKernelAbi, MIN_GAS, MIN_GAS_PRICE, DEFAULT_PORT, DEFAULT_ADDRESS, ProcedureTable, TestAbi, Capability, WriteCap, LogCap, CallCap, installEntryProc, deployedTrimmed } from '@/web3/index'
import Contract from 'web3/eth/contract';
import Root from '@/store/modules/root'
import { ABIDefinition } from 'web3/eth/abi';

export interface Network {
    address: string;
    accounts: { id: string, balance: number }[];
    instance: { contract: Contract, proc_table?: ProcedureTable };
    procedures: { name: string, contract: Contract }[];
    isSyncing: boolean;
    node: { id: string, type: string };
}

export const namespaced = true;
export const state: Network = {
    address: DEFAULT_ADDRESS,
    accounts: [],
    instance: { contract: new web3.eth.Contract([LocalKernelAbi])},
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
    set_instance(state: Network, kernel: Contract) {
        state.instance.contract = kernel;
    },
    set_instance_proc_table(state: Network, table: ProcedureTable ) {
        state.instance.proc_table = table;
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
    
    async update_instance({dispatch, commit, state}, instance?: {account?: string, address?: string}) {
        
        let contract = state.instance.contract;

        if (instance && instance.address) {
            contract.options.address = instance.address;
            contract.options.from = instance.account || state.accounts[0].id;

            commit('set_instance', contract)
        }
        
        let raw_proc_table = await contract.methods.returnProcedureTable().call();
        let table = await contract.methods.listProcedures().call();
        console.table(table)
        let proc_table = ProcedureTable.parse(raw_proc_table);

        commit('set_instance_proc_table', proc_table)

    },
    async deploy_instance({ dispatch, commit, state }, account: string = state.accounts[0].id, kernelAbi = LocalKernelAbi) {
        // Create New Kernel Contract in Memory
        const kernel = new web3.eth.Contract([kernelAbi])
        let instance = await kernel.deploy({ data: kernelAbi.bytecode } as any).send({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
        instance.options.jsonInterface = kernelAbi.abi;
        instance.options.from = account

        let name = web3.utils.toHex("Entry");
        let entryproc = await installEntryProc(instance, name, account)

        commit('set_instance', instance)
        commit('add_procedure', { contract: entryproc, name })
    },

    async deploy_procedure({ dispatch, commit, state }, proc: { name: string, abi: any }) {
        let name = web3.utils.toHex(proc.name);
        const contract = await deployedTrimmed(proc.abi, state.accounts[0].id);
        commit('add_procedure', { contract, name })
    },

    async register_procedure({ dispatch, commit, state }, proc: { name: string, address: string, caps: Capability[] }) {
        let instance = state.instance;
        if (!instance.contract) throw 'No Instance defined'

        let name = web3.utils.toHex(proc.name);
        const caps = Capability.toInput(proc.caps);

        await instance.contract.methods.registerAnyProcedure(name, proc.address, caps).send({ from: state.accounts[0].id, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
        await dispatch("update_instance")
    },

    async remove_procedure({dispatch, commit, state}, name: string) {
        let instance = state.instance
        if (!instance.contract) throw 'No Instance defined'

        await instance.contract.methods.deleteProcedure(web3.utils.toHex(name)).send({ from: state.accounts[0].id, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
        await dispatch("update_instance")
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