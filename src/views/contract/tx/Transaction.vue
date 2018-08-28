<template>
  <div class="state-tx">
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
                <b-card class="tx-head">
                  <h3>{{ tx.hash }}</h3>
                  <p> {{ tx.date.toString() }}</p>
                </b-card>
                <ul class="file-list">
                  <b-list-group v-for="([item, diffs]) in tx.changes" :key="item" tag="li">
                    <b-list-group-item variant="dark">
                      <i :class="`fas fa-${ item.icon }`"></i> 
                      {{ item.name }}
                    </b-list-group-item>
                    <b-list-group-item v-for="diff in diffs" :key="diff.location">
                      <b-row>
                        <b-col class="diff-before">
                          <li v-for="(val, index) in diff.before" :key="index">
                            <span>{{ index }} </span>
                            <span>{{ val }}</span>
                          </li>
                        </b-col>
                        <b-col tag="ul" class="diff-after">
                          <li v-for="(val, index) in diff.after" :key="index">
                            <span>{{ index }} </span>
                            <span>{{ val }}</span>
                          </li>
                        </b-col>
                      </b-row>
                    </b-list-group-item>
                  </b-list-group>
                </ul>
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
    return {};
  },
  computed: {
    tx() {
      const { hash, contract } = this.$route.params;
      let project = Vue.$currentUser().projects.get(contract);

      return project.transactions.get(hash);
    }
  },
  methods: {
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

.file-list, .tx-head {
  margin-top: 1rem;
  padding: 0;
}

.file-list >>> li {
  margin-bottom: 1rem;
}

.diff-before {
  background-color: #fad1d1;
}
.diff-after {
  background-color: rgb(128, 255, 128);
}
</style>
