<template>
  <div class=".actions">
      <b-container>
        <b-row>
            <b-col cols="12">
                <b-table 
                  :items="listActions"
                  :fields="fields"
                  :hover="true"
                  :small="true"
                  @row-clicked="viewAction">
                </b-table>
            </b-col>
        </b-row>
      </b-container>
  </div>
</template>

<script>
export default {
  name: ".View",
  data() {
    return {
      fields: [
        'name'
      ],
      error: false
    };
  },
  created() {
    this.getData();
  },
  computed: {
    kernel() {
      return this.$kernels()[this.$route.params.id];
    },
    listActions() {
      const kernel = this.$kernels()[this.$route.params.id];
      
      const d = Object.entries(kernel.procedures).map(([name, prop]) => {
          return prop.abi.map(action => ({name: action.name}))
      }).flatten()

      return d
    }
  },
  methods: {
    async getData() {
      const kernel = this.kernel.instance
      const kernelAddr = kernel.options.address
      const web3 = this.$web3();

      // Get all Used Storage Keys
      const currentKeys = await this.$getStorageKeys(kernelAddr, 100);
      if (currentKeys) {
        this.error = false

      // See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
        currentKeys.forEach(async key => {
          this.$set(this.storage, key, await web3.eth.getStorageAt(kernelAddr, key))
        })
      } else {
        this.error = true
      }      
    },
    viewAction(item) {
      
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.actions h5 {
  padding: 2rem 0 0;
}
.actions .table-hover tbody tr:hover {
  cursor: pointer;
}

.actions header.top {
  padding: 2rem 0 1rem;
}

.actions header.top .details {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #9a9a9a;
}
</style>
