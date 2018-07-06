<template>
  <div class="state-tree">
    <b-container>
        <b-row>
            <b-col cols="12">
                <b-table :items="items" :fields="fields" class="state-table" thead-class="state-table-head">
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
                </b-table>
            </b-col>
        </b-row>
    </b-container>
  </div>
</template>

<script >
import Vue from "vue";

export default {
  name: "ContractStateTree",
  data() {
    let { block, name, contract } = this.$route.params;
    let project = Vue.$currentUser().projects.get(contract);
    let folder = project.files.find(f => f.name == name);

    return {
      fields: [
        "name",
        "size",
        "latest_transaction",
        "latest_cost",
        "last_update"
      ],
      items: [...folder.children.values()]
    };
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
