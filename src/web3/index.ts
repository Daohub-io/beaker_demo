import Web3 from 'web3'

export const LocalKernelAbi = require('./Kernel.json')
export const MIN_GAS = 4712388;
export const MIN_GAS_PRICE = 100000000000;
export const DEFAULT_PORT = 8545;

// Setup Provider, Default with Localhost
export const web3 = new Web3(Web3.givenProvider || `http://localhost:${DEFAULT_PORT}`);