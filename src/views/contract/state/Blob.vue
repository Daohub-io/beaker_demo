<template>
  <div class="state-blob">
    <b-container>
        <b-row>
          <b-col cols="12">
            <b-breadcrumb :items="breadcrumb"/>
          </b-col>
        </b-row>
        <b-row>
            <b-col cols="12">
                <!-- <b-table :items="items" :fields="fields" class="state-table" thead-class="state-table-head">
                    <template slot="name" slot-scope="data">
                        <i :class="`fas fa-${ data.item.icon }`"></i> 
                        <b-link class="filename" :to="{path: `${data.item.view}/latest/${data.value}`}">{{ data.value }}</b-link>
                    </template>
                    <template slot="size" slot-scope="data">
                        <span> {{ data.value }} Keys / {{ data.value * 32 }} Bytes </span>
                    </template>
                    <template slot="latest_cost" slot-scope="data">
                        <span> {{ data.value }} Eth </span>
                    </template>
                </b-table> -->
                <b-card>
                  <b-badge v-if="isKernelLocation" variant="dark">Kernel Object</b-badge>
                  <b-badge v-else variant="info">User Object</b-badge>
                  <h3>{{ instance.name}}</h3>
                  <p>Location {{ instance.location }}</p>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "ContractStateBlob",
  data() {
    let instance = this.file();
    return {
      instance,
    };
  },
  computed: {
    isKernelLocation() {
      let location = this.file().location;
      return location[0] === 0 
    },
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
    }
  },
  methods: {
    tree() {
      const params = this.$route.params;
      const depth = Object.keys(params).length - 3;
      let tree = params[0].split("/");
      return tree;
    },
    file() {
      const { block, contract } = this.$route.params;
      let project = Vue.$currentUser().projects.get(contract);
      let tree = this.tree()
      let filename = tree.pop()
      let folder = tree.reduce((folder, item, i) => {
        // Check if folder has item
        if (!folder || !folder.files.has(item)) return false;
        // Get Item
        return folder.files.get(item)
      }, project);

      return folder.files.get(filename)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.state-blob {
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
