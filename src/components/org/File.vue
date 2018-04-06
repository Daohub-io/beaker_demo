<template>
  <div class="storage">
      <b-container>
        <b-row>
          <b-col>
            <header class="top">
              <b-breadcrumb :items="path"></b-breadcrumb>
            </header>
          </b-col>
        </b-row>
        <b-row >
            <b-col cols="12">
                <b-table 
                  :sort-by.sync="sortBy" 
                  :items="listTable"
                  :fields="fields"
                  :hover="true"
                  :small="true">
                </b-table>
            </b-col>
        </b-row>
      </b-container>
  </div>
</template>

<script>
export default {
  name: "FileView",
  data() {
    return {
      sortBy: "tableId",
      fields: [{ key: "key", sortable: true }, "value"],
      table: {},
      error: false
    };
  },
  created() {
    this.getData();
  },
  computed: {
    kernel() {
      return this.$kernels().get(this.$route.params.id);
    },
    listTable() {
      return Object.entries(this.table).map(([key, value]) => {
        return { key, value: Number(value) };
      });
    },
    tableId() {
        return Number(this.$route.params.fileId);
    },
    path() {
      const kernel = this.kernel;
      const tableId = this.tableId;
      const id = this.$route.params.id

      return [
        { text: kernel.name, to: { name: 'k_storage', replace: true } },
        { text: tableId}
      ];
    }
  },
  methods: {
    async getData() {
      const kernel = this.kernel.instance;
      const kernelAddr = kernel.options.address;
      const web3 = this.$web3();

      // Get all Used Storage Keys
      const currentKeys = await this.$getStorageKeys(kernelAddr, 100);
      if (currentKeys) {
        this.error = false;

        const tableKeys = currentKeys.filter(key => {
          return Number(key.substring(0, 4)) === this.tableId;
        });

        tableKeys.forEach(async key => {
          this.$set(
            this.table,
            key,
            await web3.eth.getStorageAt(kernelAddr, key)
          );
        });
      } else {
        this.error = true;
      }
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
