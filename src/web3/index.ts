import Web3 from 'web3'
import { Contract, ABIDefinition, Provider } from 'web3/types';

import { VueConfiguration, VueConstructor } from 'vue/types/vue';

export default { install }

const MIN_GAS = 4712388;
const MIN_GAS_PRICE = 100000000000;

declare module 'vue/types/vue' {
    // Global properties can be declared
    // on the `VueConstructor` interface
    interface VueConstructor {
        
        web3: Web3,
        accounts: string[],
        kernels: { [key: string]: Contract }
        
        $connect: (name: string, description: string, visibility: 'private' | 'shared' | 'listed') => void
        $createKernel: (name: string, kernelAbi: ContractABI, account?: string) => Contract
    }
    
}

interface ContractABI {
    bytecode: string,
    abi: ABIDefinition[]
}

// Web3 Vue Plugin
// See: https://vuejs.org/v2/guide/plugins.html
function install(Vue: VueConstructor, options: VueConfiguration) {

    // Setup Provider, Default with Localhost
    Vue.web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    Vue.accounts = [];
    Vue.kernels = {};

    Vue.prototype.$connect = async function ({ address = "http://localhost:8545" }) {
        Vue.web3.setProvider(address as any);
        Vue.accounts = await Vue.web3.eth.getAccounts();
    }

    Vue.prototype.$createKernel = async function (name: string, kernelAbi: ContractABI, account = Vue.accounts[0]) {

        // Create New Kernel Contract in Memory
        const Kernel = new Vue.web3.eth.Contract([kernelAbi])

        let instance = await Kernel.deploy({ data: kernelAbi.bytecode } as any).send({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
        instance.options.jsonInterface = kernelAbi.abi;

        // Add Kernel to List
        Vue.kernels[name] = instance;

        return instance;
    }

}
