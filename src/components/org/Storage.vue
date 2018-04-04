<template>
  <div class="storage">
      <b-container>
        <b-row>
          <b-col>
            <header class="top">
              <b-badge>Total Storage: {{ listStore.length * 8 }} Bytes </b-badge>
              <b-badge>Tables: {{ tableCount }}</b-badge>
            </header>
          </b-col>
        </b-row>
        <b-row >
            <b-col cols="12">
                <b-table 
                  :sort-by.sync="sortBy" 
                  :items="listStore"
                  :fields="fields"
                  :hover="true"
                  :small="true"
                  @row-clicked="viewTable">
                </b-table>
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
      sortBy: 'tableId',
      fields: [
        { key: 'tableId', sortable: true },
        'last action',
        'read',
        'write'
      ],
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
        const tableId = Number(key.substring(0,4))
        return {tableId, key, value}
      })
    },
    tableCount() {
      return new Set(Object.keys(this.storage).map(key => Number(key.substring(0,4)))).size
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
    viewTable(item) {
      console.log(item.tableId)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.storage h5 {
  padding: 2rem 0 0;
}
.storage .table-hover tbody tr:hover {
  cursor: pointer;
}

.storage header.top {
  padding: 2rem 0 1rem;
}
</style>
