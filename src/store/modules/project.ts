import Vue from 'vue'
import { Module } from 'vuex/types'
import { web3, LocalKernelAbi, MIN_GAS, MIN_GAS_PRICE } from '@/web3/index'
import Contract from 'web3/eth/contract';

import Root from '@/store/modules/root'

export type View = 'tree' | 'blob' | 'raw';
export type StorageLocation = [number, number, number];

export class Transaction {
    location: string = '';
}

export class File {
    readonly icon: string = 'file'
    readonly view: View = 'blob'
    public latest_transaction?: string;
    constructor(public name: string, public data: ArrayLike<number | string>, public location: StorageLocation, public size: number = 0, public latest_cost = 0, public last_update = new Date()) { }
}

export class Folder {
    readonly icon: string = 'folder';
    readonly view: View = 'tree'
    public files: { [name: string]: Folder | File } = {};

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

export interface Project {
    files: { [name: string]: File | Folder };
    gas: number;
    transactions: Array<Transaction>;
    address: string;
}

export const project: Module<Project, Root> = {
    namespaced: true,
    state: {
        files: {},
        gas: 0,
        transactions: [],
        address: ''
    },
    getters: {
        get_file: function get_file(state: Project | Folder, path: string[]): File | Folder | Error {
            let item = state.files[path[0]];
            if (item instanceof File || path.length == 1) return item;
            if (item instanceof Folder) {
                let sub = path.slice(1);
                return get_file(item, sub)
            }
            return Error('Invalid Path')
        }
    },
    mutations: {
        replace(state: Project, new_state: Project) {
            state = new_state;
        },
        set_file(state: Project, file: File) {
            state.files[file.name] = file;
        }
    },
    actions: {}
}