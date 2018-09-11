import { Module, GetterTree, MutationTree, ActionTree } from 'vuex/types'

import Root from '@/store/modules/root'

export interface Account {
    username?: string;
    projects: string[];
}

export const namespaced = true;
export const state: Account = {
    username: '',
    projects: []
};

export const getters: GetterTree<Account, Root> = {
    color(state: Account): string {
        return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    }
};

export const mutations: MutationTree<Account> = {
    set_username(state: Account, username: string) {
        state.username = username;
    }
};

export const actions: ActionTree<Account, Root> = {
    login({commit}, username: string) {
        commit('set_username', username)
    }
}