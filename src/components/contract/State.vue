<template>
  <div class="state">
    <b-container>
        <b-row>
            <b-col cols="12">
                <ul class="summary-bar">
                    <li><b>12</b> Keys</li>
                    <li><b>12</b> Keys</li>
                    <li><b>12</b> Keys</li>
                    <li><b>12</b> Keys</li>
                </ul>
            </b-col>
        </b-row>
        <b-row>
            <b-col cols="12">
                <b-table :items="items" :fields="fields" class="state-table" thead-class="state-table-head"></b-table>
            </b-col>
        </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  name: "ContractState",
  data() {
    return {
        fields: [ 'name', 'size', 'latest_transaction', 'latest_cost', 'last_update'],
        items: [
            { name: 'system', size: '24 keys/ 25kb', latest_transaction: 'os#install', latest_cost: '0.030 Eth', last_update: 'A month ago'}
        ]
    };
  },
  computed: {}
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

.state-table::after {
    border: solid 1px #333;
    border-radius: 2px;
}
.state-table >>> thead tr th {
    border: none;
    background-color: rgb(212, 212, 212);
}

.state-table >>> thead tr th:first-child {
    border-top-left-radius: 2px;
}

.state-table >>> thead tr th:last-child {
    border-top-right-radius: 2px;
}

</style>
