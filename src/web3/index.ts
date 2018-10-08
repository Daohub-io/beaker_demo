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


enum CapabilityType {
    ProcedureCall = 0x3,
    StorageWrite = 0x7,
    LogWrite = 0x9
}

export abstract class Capability {
    public raw_values: string[];

    constructor(public type: CapabilityType) { }
    // Format the capability values into the values that will be stored in the kernel.
    abstract keyValues(): Array<string | number>;

    toIntegerArray() {
        const keyValArray = this.keyValues();
        // The plus one is to account for the type value
        return [keyValArray.length + 1, this.type, ...keyValArray];
    }

    static toInput(caps: Capability[]): (number | string)[] {
        let input: (number | string)[] = [];
        for (const cap of caps) {
            input = input.concat(cap.toIntegerArray());
        }
        return input;
    }
}

export class WriteCap extends Capability {
    constructor(public address: number, public size: number) {
        super(CapabilityType.StorageWrite);
    }

    keyValues() {
        return [this.address, this.size]
    }
}

export class LogCap extends Capability {    
    constructor(public topics: string[]) {
        super(CapabilityType.LogWrite);
    }

    keyValues() {
        return [this.topics.length, ...this.topics]
    }
}

// Currently the call is a list of procedure keys it can call. If the list is
// empty it means that any procedure can be called.
export class CallCap extends Capability {
    // keys should be a list of strings
    constructor(public keys: string[] = []) {
        super(CapabilityType.ProcedureCall);
    }

    keyValues() {
        return this.keys.map(x => web3.utils.fromAscii((x as any).padEnd(32, '\0')))
    }
}

interface Procedure {
    id: string,
    key: string,
    keyIndex: string,
    location: string,
    caps: Capability[]
}

export class ProcedureTable {
    constructor(public table: { [key: string]: Procedure }) { }

    static parse(val: any[]): ProcedureTable {
        const table: { [key: string]: Procedure } = {};

        for (let i = 0; i < val.length;) {
            let proc: Procedure = {} as any;
            // Key
            proc.key = web3.utils.toHex(val[i]); i++;
            if (proc.key == "0x0") break;
            // Id
            proc.id = web3.utils.hexToUtf8(proc.key)
            // KeyIndex
            proc.keyIndex = web3.utils.toHex(val[i]); i++;
            // Location
            proc.location = web3.utils.toHex(val[i]); i++;
            // Capabilities
            proc.caps = [];
            const nCaps = web3.utils.hexToNumber(val[i]); i++;

            for (let j = 0; j < nCaps; j++) {
                const cap: Capability = {} as any;
                const length = web3.utils.hexToNumber(web3.utils.toHex(val[i])); i++;
                cap.type = web3.utils.hexToNumber(web3.utils.toHex(val[i])); i++;

                // (length - 1) as the first value is the length
                cap.raw_values = [];
                for (let k = 0; k < (length - 1); k++) {
                    cap.raw_values.push(web3.utils.toHex(val[i])); i++;
                }
                proc.caps.push(cap);
            }
            table[proc.key] = proc;
        }
        return new ProcedureTable(table);
    }
    stringify(): string {
        let str = "";
        for (const procKey of Object.keys(this.table)) {
            const proc = this.table[procKey];
            // Print key
            str += `Key: ${proc.key}\n`;
            // Print keyIndex
            str += `  KeyIndex: ${proc.keyIndex}\n`;
            // Print location
            str += `  Location: ${proc.location}\n`;
            // Print Capabilities
            str += `  Capabilities(${proc.caps.length} keys)\n`;
            for (const i in proc.caps) {
                const cap = proc.caps[i];
                str += `    Capability[${i}]: Type: ${cap.type}\n`;
                for (const j in cap.raw_values) {
                    str += `      ${j}: ${cap.raw_values[j]}\n`;
                }
            }
        }
        return str;
    }
}