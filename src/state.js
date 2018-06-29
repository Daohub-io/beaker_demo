
export default { install }

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
}

function install(Vue, options) {

    let user = new User('John');

    Vue.login = () => { user = new User() }
    Vue.currentUser = () => user;

    Vue.newProject = ({ name, description, visibility}) => {
        Vue.set(user.projects, name, new Project(name, description, visibility))
    }


}