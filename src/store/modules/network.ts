import { Module, MutationTree, ActionTree } from 'vuex/types'

import { web3, LocalKernelAbi, MIN_GAS, MIN_GAS_PRICE, DEFAULT_PORT, DEFAULT_ADDRESS } from '@/web3/index'
import Contract from 'web3/eth/contract';
import Root from '@/store/modules/root'

export interface Network {
    address: string;
    accounts: {id: string, balance: number}[];
    instances: Contract[];
    isSyncing: boolean;
    node: { id: string, type: string };
}

export const namespaced = true;
export const state: Network = {
    address: DEFAULT_ADDRESS,
    accounts: [],
    instances: [],
    isSyncing: false,
    node: { id: '', type: '' }
}

export const mutations: MutationTree<Network> = {
    set_network(state: Network, address: string) {
        state.address = address
    },
    set_accounts(state: Network, accounts: {id: string, balance: number}[]) {
        state.accounts = accounts;
    },
    add_kernel(state: Network, kernel: Contract) {
        state.instances.push(kernel)
    },
    set_node(state: Network, node: { id: string, type: string }) {
        state.node = node;
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

    async deploy_instance({ dispatch, commit, state }, account: string = state.accounts[0].id, kernelAbi = LocalKernelAbi,) {
        // Create New Kernel Contract in Memory
        const Kernel = new web3.eth.Contract([kernelAbi])
        let instance = await Kernel.deploy({ data: kernelAbi.bytecode } as any).send({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
        instance.options.jsonInterface = kernelAbi.abi;

        commit('add_kernel', instance)
    }
}