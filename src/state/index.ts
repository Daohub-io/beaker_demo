import Vue from 'vue';
import { VueConfiguration, VueConstructor } from 'vue/types/vue';

export default { install }

export type View = 'tree' | 'blob' | 'raw';
export type StorageLocation = [number, number, number];

export class File {
    readonly icon: string = 'file'
    readonly view: View = 'blob'
    public latest_transaction?: string;
    constructor(public name: string, public data: ArrayLike<number | string>, public location: StorageLocation, public size: number = 0, public latest_cost = 0, public last_update = new Date()) { }

    public read_from(store: Storage): Uint32Array[] {
        let [top, start, end] = this.location;
        let s = [top, 0, 0, 0, 0, 0, 0, 0, 0, start]
        let e = [top, 0, 0, 0, 0, 0, 0, 0, 0, end]
        return store.slice(s, e)
    }
}

export class Folder {
    readonly icon: string = 'folder';
    readonly view: View = 'tree'
    public files: {[name: string]: Folder | File} = {};

    constructor(public name: string) { }

    put<K, V extends ArrayLike<any>>(file: Folder | File) { this.files[file.name] = file }
    delete(filename: string) { return delete this.files[filename] }

    get size() {
        let total = 0;
        for (let id in this.files) {
            total += this.files[id].size
        }
        return total;
    }

    get latest_child() {
        let time = 0;
        let latest;
        for (let id in this.files) {
            if (time < this.files[id].last_update.getMilliseconds()) latest = this.files[id];
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
        for (let id in this.files) {
            this.files[id].latest_transaction = tx_hash;
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

export type Resource = File | Folder;
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
    static new_file(file: File, store: Storage): Transaction {
        let changes = new Map()
        let gas_cost = file.latest_cost * file.size;

        let diff = {
            location: file.location,
            before: [new Uint32Array(0)],
            after: file.data.toString()
        }

        let change: [Resource, Diff[]] = [file, [diff]]
        return new Transaction([change], gas_cost)
    }

    // Create Folder Tx 
    static new_folder(folder: Folder, store: Storage): Transaction {
        let tx_all = Object.keys(folder.files).map(id => {
            let item = folder.files[id];
            if (item instanceof File) return Transaction.new_file(item, store)
            if (item instanceof Folder) return Transaction.new_folder(item, store)
            throw 'Invalid File'
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
    public files: {[name: string]: File | Folder} = {};
    public gas = 0
    public actors: Array<String> = [];
    public storage: Storage = new Storage(50)
    public transactions: Array<Transaction> = []

    constructor(public name: string, public description: string = '', public visibility: 'private' | 'shared' | 'listed' = 'private') {

        const system_folder = new Folder(".system");
        const kernel_folder = new Folder("kernel");

        kernel_folder.put(new File('version', '0.0.2',[0, 0, 2], 2, 0.030, new Date()))
        kernel_folder.put(new File('procedures', ['0x4034', '0x2939485'], [0, 1000, 2000], 28, 0.030, new Date()))

        system_folder.put(kernel_folder)
        
        // Create Transaction
        const init_tx = Transaction.new_folder(system_folder, this.storage)
        this.transactions.push(init_tx)

        // Set the system folder
        this.files['.system'] = system_folder
    }
}

export class User {
    public projects: {[name: string]: Project} = {};
    public color: string = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);

    constructor(public name: string) { }

    addProject(name: string, project: Project) {
        this.projects[name] = project;
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

    let user: User | undefined;

    Vue.prototype.$login = (name: string) => { user = new User(name) }
    Vue.prototype.$currentUser = () => user!;

    Vue.prototype.$newProject = (name: string, description: string, visibility: 'private' | 'shared' | 'listed') => {
        user!.addProject(name, new Project(name, description, visibility))
        // Vue.set(user.projects, name, new Project(name, description, visibility))
    }

}