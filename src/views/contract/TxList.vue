<template>
  <div class="org">
    <b-container>
      <b-row>
        <b-col>
          <b-table :items="txs" :fields="txs_fields" class="state-table" thead-class="state-table-head">
            <template slot="hash" slot-scope="data">
                <b-link class="tx-link" :to="{name: 'contract-transaction', params: {hash: data.value}}"> {{ data.value }}</b-link>
            </template>
            <template slot="changes" slot-scope="data">
                <span> {{ data.value.length }} </span>
            </template>
            <template slot="gas_cost" slot-scope="data">
                <span>{{ data.value }}</span>
            </template>
            <template slot="date" slot-scope="data">
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
  name: "Org",
  data() {
    return {
      txs_fields: [
        'hash',
        'gas_cost',
        'date',
        'changes'
      ]
    };
  },
  computed: {
     txs() {
      const { hash, contract } = this.$route.params;
      let project = Vue.$currentUser().projects.get(contract);

      return [...project.transactions.values()]
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


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
