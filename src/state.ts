import Vue from 'vue';
import { VueConfiguration, VueConstructor } from 'vue/types/vue';

export default { install }

export type View = 'tree' | 'blob' | 'raw';

export class KernelObject {
    readonly icon: string = 'chip'
    readonly view: View = 'raw'
    constructor(public name: string, public location: Array<[number, number, number]>, public size: number = 0, public latest_transaction: string, public latest_cost = 0, public last_update = new Date()) { }
}

export class Folder {
    readonly icon: string = 'folder';
    readonly view: View = 'tree'
    public children: Map<String, File | Folder | KernelObject> = new Map();

    constructor(public name: string, public latest_transaction: string, public latest_cost = 0, public last_update = new Date()) { }

    push(filename: String, file: File | Folder | KernelObject) { this.children.set(filename, file) }
    delete(filename: String) { return this.children.delete(filename) }

    get size() {
        let total = 0;
        for (let [_, child] of this.children) {
            total += child.size
        }
        return total;
    }
}

export class File {
    readonly icon = 'file'
    readonly view: View = 'blob'
    constructor(public name: String, public size = 0, public latest_transaction = '', public latest_cost = 0, public last_update = new Date()) { }
}

export class Project {
    public files: Array<File | Folder>;
    public gas = 0
    public actors: Array<String> = [];

    constructor(public name: string, public description: string = '', public visibility: 'private' | 'shared' | 'listed' = 'private') {

        const system_folder = new Folder(
            "system",
            "os#install",
            0.030,
            new Date()
        );

        system_folder.push('version', new KernelObject('version', [[0, 0, 2]], 2, 'os#init'))
        system_folder.push('procedures', new KernelObject('procedures', [[0, 1000, 2000]], 28, 'os#init'))
        system_folder.push('filesystem', new KernelObject('filesystem', [[1, 0, 1000]], 12, 'os#init'))

        // Push the system folder
        this.files = [];
        this.files.push(system_folder)
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