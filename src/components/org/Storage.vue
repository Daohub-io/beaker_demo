<template>
  <div class="storage">
      <b-container>
        <b-row >
            <b-col cols="6">
                <h5>Storage View</h5>
                <b-table :items="listStore" small="true"></b-table>
            </b-col>
        </b-row>
      </b-container>
  </div>
</template>

<script>
export default {
  name: "StorageView",
  data() {
    return {
      storage: {},
      error: false
    };
  },
  mounted() {
    this.getData();
  },
  computed: {
    kernel() {
      return this.$kernels().get(this.$route.params.id);
    },
    listStore() {
      return Object.entries(this.storage).map(([key, value]) => {
        return {key, value}
      })
    }
  },
  methods: {
    async getData() {
      const kernel = this.kernel.instance
      const kernelAddr = kernel.options.address
      const web3 = this.$web3();

      // Get all Used Storage Keys
      const currentKeys = await this.$getStorageKeys(kernelAddr, 32);
      if (currentKeys) {
        this.error = false

      // See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
        currentKeys.forEach(async key => {
          this.$set(this.storage, key, await web3.eth.getStorageAt(kernelAddr, key))
        })
      } else {
        this.error = true
      }      
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.storage h5 {
    padding: 2rem 0 0;
} 
</style>
