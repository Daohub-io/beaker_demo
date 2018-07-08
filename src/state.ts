import Vue from 'vue';
import { VueConfiguration, VueConstructor } from 'vue/types/vue';

export default { install }

export type View = 'tree' | 'blob' | 'raw';
export type StorageLocation = [number, number, number];

export class KernelObject {
    readonly icon: string = 'microchip'
    readonly view: View = 'blob'
    constructor(public name: string, public location: Array<StorageLocation>, public size: number = 0, public latest_transaction: string, public latest_cost = 0, public last_update = new Date()) { }
}

export class File<K, T extends Iterable<K>> {
    readonly icon = 'file'
    readonly view: View = 'blob'
    constructor(public name: String, readonly data: T, public size = 0, public latest_transaction = '', public latest_cost = 0, public last_update = new Date()) { }
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
        return this.latest_child!.latest_transaction;
    }

    get latest_cost(): number {
        return this.latest_child!.latest_cost;
    }
}


export class Project {
    public files: Map<String, File<any, Iterable<any>> | Folder> = new Map();
    public gas = 0
    public actors: Array<String> = [];

    constructor(public name: string, public description: string = '', public visibility: 'private' | 'shared' | 'listed' = 'private') {

        const system_folder = new Folder(".system");

        system_folder.put(new KernelObject('version', [[0, 0, 2]], 2, 'os#init', 0.030, new Date()))
        system_folder.put(new KernelObject('procedures', [[0, 1000, 2000]], 28, 'os#init', 0.030, new Date()))
        system_folder.put(new KernelObject('filesystem', [[1, 0, 1000]], 12, 'os#init', 0.030, new Date()))

        // Push the system folder
        this.files.set('.system', system_folder)
    }

}

export class User {
    public color: string;
    public projects: Map<string, Project> = new Map();

    constructor(public name: string) {
        this.name = name
        this.color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    }

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