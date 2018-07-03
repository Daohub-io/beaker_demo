
export default { install }

class File {
    name = ''
    icon = ''
    type = 'file'
    file_size = 0
    latest_transaction = ''
    latest_cost = 0
    last_update = new Date()
    children = new Map()

    constructor(file) { return Object.assign(this, file) }

    push(filename, file) { this.children.set(filename, new File(file))}
    delete(filename) { this.children.delete(filename) }
    
    set size(size) {
        this.file_size = size;
    }
    get size() {
        if (this.type == 'file') {
            return this.file_size;
        } else {
            let total = 0;
            for (let child of this.children) {
                if (child instanceof File) total += child.size()
            }
            return total;
        }
    }

}

class Project {
    name = ''
    description = ''
    visibility = 'private'
    files = []
    gas = 0
    actors = []

    constructor(name, description, visibility) {
        this.name = name;
        this.description = description;
        this.visibility = visibility;

        const system_folder = new File({
            name: "system",
            icon: "folder",
            type: "folder",
            size: 24,
            latest_transaction: "os#install",
            latest_cost: "0.030",
            last_update: "A month ago"
        });

        system_folder.push(new File({
            name: 'files',
            type: 'object',
        }))

        system_folder.push(new File({
            name: 'procedure_list',
            type: 'object',
        }))

        system_folder.push(new File({
            name: 'capability_lists',
            type: 'object',
        }))

        // Push the system folder
        this.files.push(system_folder)
    }

}

class User {
    name = ''
    color = ''
    projects = {}

    constructor(name) {
        this.name = name
        this.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    }

    addProject(name, project) {
        this.projects[name] = project;
    }

}

function install(Vue, options) {

    let user = new User('John');

    Vue.login = () => { user = new User() }
    Vue.currentUser = () => user;

    Vue.newProject = ({ name, description, visibility}) => {
        user.addProject(name, new Project(name, description, visibility))
        // Vue.set(user.projects, name, new Project(name, description, visibility))
    }

}