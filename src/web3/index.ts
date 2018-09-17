import Web3 from 'web3'

export const MIN_GAS = 4712388;
export const MIN_GAS_PRICE = 100000000000;
export const DEFAULT_PORT = 8545;
export const DEFAULT_ADDRESS = `ws://localhost:${DEFAULT_PORT}`;

export const TestAbi = {
    proc: { call: require('./contracts/SysCallTestCall.json') },
    log: { write: require('./contracts/SysCallTestLog.json') },
    store: {
        write: require('./contracts/SysCallTest.json'),
    }
}

export const LocalKernelAbi = require('./contracts/Kernel.json')

// Setup Provider, Default with Localhost
export const web3 = new Web3(DEFAULT_ADDRESS);