
import Web3 from 'web3'

import KernelABI from './abi/Kernel.json';

const MIN_GAS = 4712388;
const MIN_GAS_PRICE = 100000000000;


// class Organization {
//     kernel = {}
//     address = ''
//     name = ''
//     storageKeys = []

//     constructor(name, address, kernel) {
//         this.name = name
//         this.address = address
//         this.kernel = kernel
//     }



// }

// Web3 Vue Plugin
// See: https://vuejs.org/v2/guide/plugins.html
export default {

    install(Vue) {

        // Setup Provider, Default with Localhost
        Vue.web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
        Vue.accounts = [];
        Vue.kernels = {};
        Vue.modules = [];

        Vue.prototype.$web3 = () => Vue.web3;
        Vue.prototype.$accounts = () => Vue.accounts;
        Vue.prototype.$kernels = () => Vue.kernels;
        Vue.prototype.$modules = () => Vue.modules;

        Vue.prototype.$MIN_GAS = () => MIN_GAS;
        Vue.prototype.$MIN_GAS_PRICE = () => MIN_GAS_PRICE;

        Vue.prototype.$getStorageKeys = async function (address, quantity, start = null, block = 'latest') {
            const req = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({
                    id: "1",
                    method: "parity_listStorageKeys",
                    jsonrpc: "2.0",
                    params: [address, quantity, start, block]
                })
            }

            let res = await fetch(Vue.web3.currentProvider.host, req)
            let { result } = await res.json()

            return result
        }

        Vue.prototype.$unlockAccount = async function (account, password) {

            const req = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({
                    id: "1",
                    method: "personal_unlockAccount",
                    jsonrpc: "2.0",
                    params: [account, password, null]
                })
            }

            await fetch(Vue.web3.currentProvider.host, req)
        }

        Vue.prototype.$connect = async function ({ address = "http://localhost:8545" }) {
            Vue.web3.setProvider(address);
            Vue.accounts = await Vue.web3.eth.getAccounts();
        }

        Vue.prototype.$createKernel = async function ({ name, account = false, password = '' }) {
            // Unlock Account
            if (!account) account = Vue.accounts[1];
            await this.$unlockAccount(account, password)

            const Kernel = new Vue.web3.eth.Contract([KernelABI])
            let instance = await Kernel.deploy({ data: KernelABI.bytecode }).send({ from: account, gas: MIN_GAS, gasPrice: MIN_GAS_PRICE })
            instance.options.jsonInterface = KernelABI.abi;

            // Add Kernel to List
            Vue.kernels[instance.options.address] = { name, instance, procedures: {} }
            return instance;
        }

        Vue.prototype.$createProcedure = async function (kernel, procedure, account = false, password = '') {
            // Unlock Account
            if (!account) account = Vue.accounts[1];
            await this.$unlockAccount(account, password)

            // Parse Abi
            const abi = JSON.parse(procedure.abi)

            // Convert to Hex
            const code = Vue.web3.utils.toHex(abi.bytecode);
            const hex_name = Vue.web3.utils.toHex(procedure.name)

            await kernel.methods.createProcedure(hex_name, code).send({
                from: account,
                gas: this.$MIN_GAS(),
                gasPrice: this.$MIN_GAS_PRICE()
            });

        }

        Vue.prototype.$saveProcedure = function (kernel, procedure) {
            Vue.set(Vue.kernels[kernel.options.address].procedures, procedure.name, JSON.parse(procedure.abi))
        }

    }
}



