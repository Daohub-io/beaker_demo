<template>
  <div class="state">
    <b-container>
        <b-row>
            <b-col cols="12">
                <ul class="summary-bar">
                    <li><b>1</b> Transactions</li>
                    <li><b>{{ items.reduce((sum, item) => item.size + sum, 0) }}</b> Keys</li>
                    <li><b>4</b> Procedures</li>
                    <li><b>0</b> Eth</li>
                </ul>
            </b-col>
        </b-row>
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
                    <template slot="latest_transaction" slot-scope="data">
                        <b-link class="tx-link" :to="{name: 'contract-transaction', params: {hash: data.value}}"> {{ data.value }}</b-link>
                    </template>
                    <template slot="latest_cost" slot-scope="data">
                        <span> {{ data.value }} Eth </span>
                    </template>
                    <template slot="last_update" slot-scope="data">
                        <span> {{ elapsed(data.value) }}</span>
                    </template>
                </b-table>
            </b-col>
        </b-row>
    </b-container>
  </div>
</template>

<script >
import Vue from 'vue'

export default {
  name: "ContractState",
  data() {

    let { contract } = this.$route.params;
    let project = Vue.$currentUser().projects.get(contract);

    return {
      fields: [
        "name",
        "size",
        "latest_transaction",
        "latest_cost",
        "last_update"
      ],
      items: [...project.files.values()]
    };
  },
  computed: {},
  methods: {
    // Get Elapsed Time in Seconds/Minutes/Hours/Days/Months/Years
    elapsed(from) {
      let mills = new Date().getTime() - from.getTime();
      if (mills < 0) throw 'Time cannot be in future'
      if (mills < 2000) return 'Just Now'
      if (mills < 60000) return Math.floor(mills/1000) + ' seconds ago'
      if (mills < 360000) return Math.floor(mills/60000) + ' minutes ago'
      if (mills < 360000 * 30) return Math.floor(mills/360000) + ' hours ago'
      if (mills < 360000 * 30 * 12) return Math.floor(mills/360000/30) + ' months ago'
      return Math.floor(mills/360000/30/12) + ' years ago'
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul.summary-bar {
  padding: 0.8rem 0;
  margin: 1rem 0;
  list-style: none;
  display: flex;
  width: 100%;
  justify-content: space-around;
  border: 1px solid rgb(189, 189, 189);
  border-radius: 3px;
}

ul.summary-bar li {
  flex-basis: 1;
  font-size: 0.9rem;
  color: #555;
}

ul.summary-bar li b {
  color: #000;
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
