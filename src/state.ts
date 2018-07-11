import Vue from 'vue';
import { VueConfiguration, VueConstructor } from 'vue/types/vue';

export default { install }

export type View = 'tree' | 'blob' | 'raw';
export type StorageLocation = [number, number, number];

export class KernelObject {
    readonly icon: string = 'microchip'
    readonly view: View = 'blob'
    public latest_transaction?: string;
    constructor(public name: string, public location: StorageLocation, public size: number = 0, public latest_cost = 0, public last_update = new Date()) { }

    public read_from(store: Storage): Uint32Array[] {
        let [top, start, end] = this.location;
        let s = [top, 0, 0, 0, 0, 0, 0, 0, 0, start]
        let e = [top, 0, 0, 0, 0, 0, 0, 0, 0, end]
        return store.slice(s, e)
    }
}

export class File<K, T extends Iterable<K>> {
    readonly icon = 'file'
    readonly view: View = 'blob'
    public latest_transaction?: string;
    constructor(public name: String, readonly data: T, public size = 0, public latest_cost = 0, public last_update = new Date()) { }
}

export class Folder {
    readonly icon: string = 'folder';
    readonly view: View = 'tree'
    public files: Map<String, File<any, Iterable<any>> | Folder | KernelObject> = new Map();

    constructor(public name: string) { }

    put<K, V extends Iterable<any>>(file: File<K, V> | Folder | KernelObject) { this.files.set(file.name, file) }
    delete(filename: String) { return this.files.delete(filename) }

    get size() {
        let total = 0;
        for (let [_, child] of this.files) {
            total += child.size
        }
        return total;
    }

    get latest_child() {
        let time = 0;
        let latest;
        for (let [_, child] of this.files) {
            if (time < child.last_update.getMilliseconds()) latest = child;
        }
        return latest;
    }

    get last_update(): Date {
        return this.latest_child!.last_update
    }

    get latest_transaction(): string {
        return this.latest_child!.latest_transaction!;
    }

    set latest_transaction(tx_hash: string) {
        for (let [_, child] of this.files) {
            console.log(`${child.name}: ${tx_hash}`)
            child.latest_transaction = tx_hash;
        }
    }

    get latest_cost(): number {
        return this.latest_child!.latest_cost;
    }
}

interface Diff {
    location: StorageLocation | number;
    before: Uint32Array[] | string;
    after: Uint32Array[] | string;
}

interface ToString {
    [Symbol.toStringTag](): string
}

export type Resource = File<any, any> | KernelObject | Folder;
class Transaction {
    public hash: string = (Math.random() * 10**6).toString(16)
    constructor(public changes: [Resource, Array<Diff>][], public gas_cost = 0, readonly date = new Date()) {
        // Update latest_transaction for each resource
        const hash = this.hash
        this.changes.forEach(([resource, ] )=> {
            resource.latest_transaction = hash;
        })
    }

    // Create File Tx
    static new_file<ToString, T extends Iterable<ToString>>(file: File<ToString, T>): Transaction {
        let gas_cost = file.latest_cost * file.size;

        let diffs = Array.from(file.data).map((item, i) => ({
            location: i,
            before: [new Uint32Array(0)],
            after: item.toString()
        }))

        let change: [Resource, Diff[]] = [file, diffs]
        return new Transaction([change], gas_cost)
    }

    // Create KernelObject Tx
    static new_object(obj: KernelObject, store: Storage): Transaction {
        let changes = new Map()
        let gas_cost = obj.latest_cost * obj.size;

        let diff = {
            location: obj.location,
            before: [new Uint32Array(0)],
            after: obj.read_from(store)
        }

        let change: [Resource, Diff[]] = [obj, [diff]]
        return new Transaction([change], gas_cost)
    }

    // Create Folder Tx 
    static new_folder(folder: Folder, store: Storage): Transaction {
        let tx_all = [...folder.files.values()].map(item => {
            let tx: Transaction;
            if (item instanceof KernelObject) tx = Transaction.new_object(item, store)
            if (item instanceof File) tx = Transaction.new_file(item)
            if (item instanceof Folder) tx = Transaction.new_folder(item, store)
            if (item instanceof Transaction) throw 'ERROR'
            return tx!;
        })
        let gas_cost = tx_all.reduce((total, tx) => total + tx.gas_cost, 0)
        let changes = tx_all.map(({ changes }) => changes).reduce((prev, item) => prev.concat(item))
        return new Transaction(changes, gas_cost)
    }
}

class Storage implements Iterable<Uint32Array>{
    private data: Map<Uint32Array, Uint32Array> = new Map();
    constructor(keys: number) {
        for (let i = 0; i < keys; i += 1) {
            let key = new Uint32Array(8);
            key.set([i], 7)
            this.data.set(key, new Uint32Array(8))
        }
    }

    public [Symbol.iterator]() {
        return this.data.values()
    }

    get_raw(key: Uint32Array): Uint32Array {
        return this.data.get(key)!
    }

    get(key_num: number[]): number[] {
        let key = Uint32Array.from(key_num)
        let value = this.data.get(key);
        return Array.from(value!)
    }

    slice(start: number[], end: number[]): Uint32Array[] {
        let arr = []
        for (let s = start; s < end; s[7] += 1) {
            let key = Uint32Array.from(s)
            arr.push(this.get_raw(key))
        }
        return arr;
    }

    set_raw(key: Uint32Array, value: Uint32Array) {
        return this.data.set(key, value)
    }

    set(key_num: number[], value_num: number[]) {
        let key = Uint32Array.from(key_num)
        let value = Uint32Array.from(value_num)
        return this.data.set(key, value)
    }

}
export class Project {
    public files: Map<String, File<any, Iterable<any>> | Folder> = new Map();
    public gas = 0
    public actors: Array<String> = [];
    public storage: Storage = new Storage(50)
    public transactions: Map<string, Transaction> = new Map()

    constructor(public name: string, public description: string = '', public visibility: 'private' | 'shared' | 'listed' = 'private') {

        const system_folder = new Folder(".system");
        const kernel_folder = new Folder("kernel");

        kernel_folder.put(new KernelObject('version', [0, 0, 2], 2, 0.030, new Date()))
        kernel_folder.put(new KernelObject('procedures', [0, 1000, 2000], 28, 0.030, new Date()))

        system_folder.put(kernel_folder)
        system_folder.put(new KernelObject('filesystem', [1, 0, 1000], 12, 0.030, new Date()))
        
        // Create Transaction
        const init_tx = Transaction.new_folder(system_folder, this.storage)
        this.transactions.set(init_tx.hash, init_tx)

        // Set the system folder
        this.files.set('.system', system_folder)
    }
}

export class User {
    public projects: Map<string, Project> = new Map();
    public color: string = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);

    constructor(public name: string) { }

    addProject(name: string, project: Project) {
        this.projects.set(name, project);
    }
}

declare module 'vue/types/vue' {
    // Global properties can be declared
    // on the `VueConstructor` interface
    interface VueConstructor {
        $login: (name: string) => void,
        $currentUser: () => User,
        $newProject: (name: string, description: string, visibility: 'private' | 'shared' | 'listed') => void
    }
}

function install(Vue: VueConstructor, options: VueConfiguration) {

    let user: User | undefined = new User('John');

    Vue.$login = (name: string) => { user = new User(name) }
    Vue.$currentUser = () => user!;

    Vue.$newProject = (name: string, description: string, visibility: 'private' | 'shared' | 'listed') => {
        user!.addProject(name, new Project(name, description, visibility))
        // Vue.set(user.projects, name, new Project(name, description, visibility))
    }

}