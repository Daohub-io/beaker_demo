<template>
  <div class="list">
    <b-container>
      
    </b-container>
  </div>
</template>

<script>

export default {
  name: "ListOrg",
  data() {
    return {};
  },
  computed: {
    // See http://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#properties
    organizations() {
      let kernels = this.$kernels();
      let web3 = this.$web3();

      return Object.entries(kernels).map(([address, {name}]) => {
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
