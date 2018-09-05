import { Module } from 'vuex/types'

export interface Account {
    username?: string;
    projects: string[];
}

export const account: Module<Account, any> = {
    namespaced: true,
    state: {
        projects: []
    },
    getters: {
        color(state: Account): string {
            return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
        }
    },
    mutations: {
        login(state: Account, username: string) {
            state.username = username;
        }
    },
}