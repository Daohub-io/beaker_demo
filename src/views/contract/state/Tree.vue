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
                <b-table :items="files" :fields="fields" class="state-table" thead-class="state-table-head">
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
                    <template slot="last_update" slot-scope="data">
                        <span> {{ data.value.toDateString() }}</span>
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
    let files = this.files;

    return {
      fields: [
        "name",
        "size",
        "latest_transaction",
        "latest_cost",
        "last_update"
      ]
    };
  },
  computed: {
    breadcrumb() {
      const { owner, contract } = this.$route.params;
      let path = this.$route.path.slice().split("/");
      path[3] = "tree";

      let current = path.slice(5);
      let links = current.map((item, i, arr) => ({
        text: item,
        to: {
          path: path
            .slice()
            .slice(0, 5)
            .concat(arr.slice(0, i + 1))
            .join("/")
        }
      }));

      links.unshift({
        text: contract,
        to: { name: "contract", params: { owner, contract } }
      });

      return links;
    },
    files() {
      const { block, contract } = this.$route.params;
      let project = Vue.$currentUser().projects.get(contract);

      let folder = this.tree().reduce((folder, item, i) => {
        // Check if folder has item
        if (!folder || !folder.files.has(item)) return false;
        // Get Item
        return folder.files.get(item);
      }, project);

      if (!folder || folder.view !== "tree") return false;
      return [...folder.files.values()];
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
      let tree = params[0].split("/");
      return tree;
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
