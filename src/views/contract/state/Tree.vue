<template>
  <div class="state-tree">
    <b-container>
        <b-row>
          <b-col cols="12">
            <b-breadcrumb :items="breadcrumb"/>
          </b-col>
        </b-row>
        <b-row>
            <b-col cols="12">
                <b-table :items="items" :fields="fields" class="state-table" thead-class="state-table-head">
                    <template slot="name" slot-scope="data">
                        <i :class="`fas fa-${ data.item.icon }`"></i>
                        <b-link class="filename" :to="{path: path(data.item.view, data.value)}">{{ data.value }}</b-link>
                    </template>
                    <template slot="size" slot-scope="data">
                        <span> {{ data.value }} Keys / {{ data.value * 32 }} Bytes </span>
                    </template>
                    <template slot="latest_cost" slot-scope="data">
                        <span> {{ data.value }} Eth </span>
                    </template>
                </b-table>
            </b-col>
        </b-row>
    </b-container>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "ContractStateTree",
  data() {
    let files = this.files();

    return {
      fields: [
        "name",
        "size",
        "latest_transaction",
        "latest_cost",
        "last_update"
      ],
      items: files
    };
  },
  computed: {
    breadcrumb() {
      const { contract } = this.$route.params;
      let path = this.$route.path.slice().split('/');

      let current = path.slice(5);

      let links = current.map((item, i, arr) => ({
        text: item,
        to: { path: arr.slice(0,i).join("/")}
      }))

      links.unshift({ text: contract, to: { path: path.slice(0, 3).join('/') } });

      return links;
    }
  },
  methods: {
    path(view, target) {
      let path = this.$route.path;
      let current = path.split("/");
      current[3] = view;
      current.push(target);

      return current.join("/");
    },
    tree() {
      const params = this.$route.params;
      const depth = Object.keys(params).length - 3;
      let tree = [];
      for (let i = 0; i < depth; i += 1) {
        tree[i] = params[i];
      }
      return tree;
    },
    files() {
      const { block, contract } = this.$route.params;
      let project = Vue.$currentUser().projects.get(contract);

      let folder = this.tree().reduce((folder, item, i) => {
        // Check if folder has item
        if (!folder || !folder.has(item)) return false;
        // Get Item
        return folder.get(item);
      }, project.files);

      if (!folder || folder.view !== "tree") return false;
      return [...folder.children.values()];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.state-tree {
  margin-top: 1rem;
}
.state-table {
  font-size: 0.9rem;
  border-collapse: separate;
  border-spacing: 0;
  border: solid 1px #cacaca;
  border-radius: 2px;
}
.state-table >>> thead tr {
  border-bottom: solid 1px #cacaca;
  background-color: rgb(212, 212, 212);
  font-weight: 300;
}

.state-table >>> thead tr th {
  font-weight: 300;
  border: none;
}

.state-table >>> tbody {
  border: 1px solid #333;
}

.state-table .filename {
  margin-left: 4px;
}
</style>
