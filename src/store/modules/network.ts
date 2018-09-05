import { Module } from 'vuex/types'

import {web3, LocalKernelAbi, MIN_GAS, MIN_GAS_PRICE} from '@/web3/index'
import Contract from 'web3/eth/contract';

export interface Network {
    accounts: string[];
    instances: Contract[];
}

export const network: Module<Network, any> = {
    namespaced: true,
    state: { accounts: [], instances: [] },
    getters: {
        accounts(state: Network, id: number): string {
            return state.accounts[id]
        }
    },
    mutations: {
        set_accounts(state: Network, accounts: string[]) {
            state.accounts = accounts;
        },
        add_kernel(state: Network, kernel: Contract) {
            state.instances.push(kernel)
        }
    },
    actions: {
        async connect({dispatch, commit}, address: string) {
            web3.setProvider(address as any);
            let accounts = await web3.eth.getAccounts();
            commit('set_accounts', accounts)
        },
        async deploy_kernel({dispatch, commit, state}, kernelAbi = LocalKernelAbi, account: string = state.accounts[0]) {
            // Create New Kernel Contract in Memory
            const Kernel = new web3.eth.Contract([kernelAbi])
            let instance = await Kernel.deploy({ data: kernelAbi.bytecode } as any).send({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
            instance.options.jsonInterface = kernelAbi.abi;
            
            commit('add_kernel', instance)
        }
    }
}