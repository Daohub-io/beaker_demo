<template>
  <div class="state-blob">
    <b-container>
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
                <b-card :title="file.name">
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
    let file = this.file()
    
    return {
      file
    };
  },
  methods: {
    tree() {
      const params = this.$route.params;
      const depth = Object.keys(params).length - 3;
      let tree = [];
      for (let i = 0; i < depth; i += 1) {
        tree[i] = params[i];
      }
      return tree;
    },
    file() {
      const { block, contract } = this.$route.params;
      let project = Vue.$currentUser().projects.get(contract);

      let file = this.tree().reduce((folder, item, i) => {
        // Check if folder has item
        if (!folder || !folder.has(item)) return false;
        // Get Item
        return folder.get(item);
        
      }, project.files);

      if (!file || file.view !== 'blob') return false;
      return file;
    }
  }
  //   beforeMount() {
  //     console.log(this.folder)
  //     if (!this.folder) this.$router.push({ path: "404" });
  //     if (this.folder.view !== "tree") this.$router.push({ path: "404" });
  //   },
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
