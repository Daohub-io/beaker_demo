<template>
  <div class="storage">
      <b-container>
        <b-row>
          <b-col>
            <header class="top">
              <b-nav fill class="details">
                <b-nav-item>{{ listStore.length * 8 }} Bytes</b-nav-item>
                <b-nav-item>{{ tableCount }} Files</b-nav-item>
                <b-nav-item>{{ 0 }} Changes</b-nav-item>
                <b-nav-item>{{ 0 }} Members</b-nav-item>
              </b-nav>
            </header>
          </b-col>
        </b-row>
        <b-row>
            <b-col cols="12">
                <b-table 
                  :sort-by.sync="sortBy" 
                  :items="listFiles"
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
      sortBy: 'fileId',
      fields: [
        { key: 'fileId', sortable: true },
        'type',
        'size',
        'last action'
      ],
      storage: {},
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
    listStore() {
      return Object.entries(this.storage).map(([key, value]) => {
        const fileId = Number(key.substring(0,4))
        return {fileId, key, value, type: 'raw'}
      })
    },
    listFiles() {
      let keys = this.listStore
      let keyMap = keys.reduce((files, values) => {
        if (files[values.fileId]) {
          files[values.fileId] += 1;
        } else {
          files[values.fileId] = 1;
        }
        return files;
      }, {})
      return Object.entries(keyMap).map(([fileId, size]) => ({ fileId, size, type: 'raw' }))
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
      this.$router.push({name: 'k_table', params: { fileId: item.fileId} })
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

.storage header.top .details {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #9a9a9a;
}
</style>
