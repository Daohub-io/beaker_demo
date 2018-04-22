<template>
  <div class="list">
    <b-container>
      <b-table striped hover :items="modules">
        <template slot="name" slot-scope="data">
          <b-btn size="sm" :to="'/module/'+data.item.address">{{data.item.name}}</b-btn>
        </template>
      </b-table>
    </b-container>
  </div>
</template>

<script>

export default {
  name: "ListModules",
  data() {
    return {};
  },
  computed: {
    // See http://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#properties
    modules() {
      let modules = this.$modules();
      let web3 = this.$web3();

      return modules.map(module => {
          return {
              name,
              address,
              balance: 0
          };
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
