import { Module, MutationTree, ActionTree } from 'vuex/types'

import { web3, LocalKernelAbi, MIN_GAS, MIN_GAS_PRICE, DEFAULT_PORT, DEFAULT_ADDRESS, ProcedureTable, TestAbi, Capability, WriteCap, LogCap, CallCap, installEntryProc, deployedTrimmed, trimSwarm } from '@/web3/index'
import Contract from 'web3/eth/contract';
import Root from '@/store/modules/root'
import { ABIDefinition } from 'web3/eth/abi';
import { Block, BlockHeader } from 'web3/eth/types';
import { TransactionReceipt, Subscribe } from 'web3/types';
import Vue from 'vue';

type Opcodes = string;
export interface Network {
    address: string;
    accounts: { id: string, balance: number }[];
    instance: { contract: Contract, proc_table?: ProcedureTable };
    public: {
        latest_block: number,
        instances: string[],
        procedures: { [address: string]: { code: Opcodes, abi?: ABIDefinition[] } },
        known_abi: { bytecode: string, deployedBytecode: string, abi: ABIDefinition[] }[]
    }
    procedures: { name: string, contract: Contract }[];
    isSyncing: boolean;
    node: { id: string, type: string };
    subscriptions: {
        on_block: Promise<Subscribe<BlockHeader>>,
        on_sync: Promise<Subscribe<any>>
    }
}

export const namespaced = true;
export const state: Network = {
    address: DEFAULT_ADDRESS,
    accounts: [],
    instance: { contract: new web3.eth.Contract(LocalKernelAbi.abi) },
    public: {
        latest_block: 0,
        instances: [],
        procedures: {},
        known_abi: [TestAbi.entry, TestAbi.log.write, TestAbi.proc.call, TestAbi.store.write]
    },
    procedures: [],
    isSyncing: false,
    node: { id: '', type: '' },
    subscriptions: {
        on_block: web3.eth.subscribe('newBlockHeaders'),
        on_sync: web3.eth.subscribe('syncing')
    }
}

export const mutations: MutationTree<Network> = {
    set_network(state: Network, address: string) {
        state.address = address
    },
    add_public_instance(state: Network, address: string) {
        if (state.public.instances.indexOf(address) === -1) state.public.instances.push(address)
    },
    add_public_procedure(state: Network, procedure: { address: string, code: string, abi?: ABIDefinition[] }) {
        Vue.set(state.public.procedures, procedure.address.toLowerCase(), { code: procedure.code, abi: procedure.abi })
    },
    set_public_latest_block(state: Network, last_block: number) {
        state.public.latest_block = last_block;
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
    set_instance_proc_table(state: Network, table: ProcedureTable) {
        state.instance.proc_table = table;
    },
    add_procedure(state: Network, procedure: { contract: Contract, name: string }) {
        state.procedures.push(procedure)
    },
    set_sync(state: Network, isSyncing: boolean) {
        state.isSyncing = isSyncing
    }
}

export const actions: ActionTree<Network, Root> = {
    async connect({ state, dispatch, commit }, address: string = DEFAULT_ADDRESS) {
        web3.setProvider(address as any)
        commit('set_node', { id: await web3.eth.net.getId(), type: await (web3.eth.net as any).getNetworkType() })

        await dispatch('update_accounts');

        let block_sub = await state.subscriptions.on_block;
        let sync_sub = await state.subscriptions.on_sync;

        dispatch('update_network')
        block_sub.on('data', () => dispatch('update_network'))
        sync_sub.on("changed", isSyncing => {
            commit('set_sync', isSyncing)
            dispatch('update_accounts')
        });
    },

    async update_accounts({state, dispatch, commit}) {
         // Get Accounts and Balance for Each
         let list = await web3.eth.getAccounts()
         let accounts: Network['accounts'] = await Promise.all(list.map(async id => ({
             id,
             balance: await web3.eth.getBalance(id)
         })));

         commit('set_accounts', accounts)
    },

    async update_network({ state, commit }) {

        let len = state.public.latest_block;
        let latest = await web3.eth.getBlockNumber();

        // If it's more than 200... let's just skip some;
        if (latest - len > 200) len = latest - 200;

        let contracts: { address: string, code: string }[] = [];

        for (let i = len; i < latest; i += 1) {
            let block = await web3.eth.getBlock(i)

            let receipts = await Promise.all(block.transactions.map(async tx => {
                let receipt: TransactionReceipt = await web3.eth.getTransactionReceipt(tx as any)
                let address = receipt.contractAddress
                let code = '';
                if (address) code = await web3.eth.getCode(address)
                return { address, code }
            }))

            contracts = contracts.concat(receipts.filter(({ address }) => address));
        }

        // Update Instances
        let known_instances = contracts.filter(contract => contract.code === LocalKernelAbi.deployedBytecode).map(contract => contract.address);
        known_instances.forEach(i => commit('add_public_instance', i))

        let kernel = state.instance.contract;
        if (kernel.options.address !== null) {
            let non_instances = contracts.filter(contract => contract.code !== LocalKernelAbi.deployedBytecode);
            let known_procedures = await Promise.all(non_instances.filter(async contract => await kernel.methods.validate(contract.code).call()))

            // Check if Abi + Update Procedures
            known_procedures.map(contract => {
                let def = state.public.known_abi.find(def => trimSwarm(def.deployedBytecode) === contract.code) || { abi: undefined }
                return { ...contract, abi: def.abi }
            }).forEach(proc => commit('add_public_procedure', proc))

            // Update Latest Length
            commit('set_public_latest_block', latest)
        }

    },

    async update_instance({ dispatch, commit, state }, instance?: { account?: string, address?: string }) {

        let contract = state.instance.contract;

        if (instance && instance.address) {
            contract.options.address = instance.address;
            contract.options.from = instance.account || state.accounts[0].id;

            commit('set_instance', contract)
        }

        let raw_proc_table = await contract.methods.returnProcedureTable().call();
        let table = await contract.methods.listProcedures().call();
        let proc_table = ProcedureTable.parse(raw_proc_table);

        commit('set_instance_proc_table', proc_table)
        await dispatch('update_network')
    },

    async deploy_instance({ dispatch, commit, state }, account: string = state.accounts[0].id) {
        // Create New Kernel Contract in Memory
        const kernel = state.instance.contract;
        let instance = await kernel.deploy({ data: LocalKernelAbi.bytecode } as any).send({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
        instance.options.jsonInterface = LocalKernelAbi.abi;
        instance.options.from = account

        let name = web3.utils.toHex("Entry");
        let entryproc = await installEntryProc(instance, name, account)

        commit('set_instance', instance)
        commit('add_procedure', { contract: entryproc, name })

        await dispatch('update_instance')
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

    async remove_procedure({ dispatch, commit, state }, name: string) {
        let instance = state.instance
        if (!instance.contract) throw 'No Instance defined'

        await instance.contract.methods.deleteProcedure(web3.utils.toHex(name)).send({ from: state.accounts[0].id, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
        await dispatch("update_instance")
    },

    async send_call({ dispatch, commit, state }, call: { proc_name: string, abi: ABIDefinition, instance: Contract }) {
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