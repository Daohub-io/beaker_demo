<template>
  <div class="procedure">
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
                  :items="procedure.abi"
                  :fields="fields"
                  :hover="true"
                  :small="true">
                  
                  <template slot="inputs" slot-scope="data">
                    <span v-for="param in data.item.inputs">
                      {{ param.name }}:{{ param.type}}
                    </span>
                  </template>

                   <template slot="outputs" slot-scope="data">
                    <span v-for="param in data.item.outputs">
                      {{ param.name }}:{{ param.type}}
                    </span>
                  </template>
                  
                </b-table>
            </b-col>
        </b-row>
      </b-container>
  </div>
</template>

<script>
export default {
  name: "ProcedureView",
  data() {
    return {
      sortBy: "key",
      fields: ["name", "inputs", "outputs"],
      name: "",
      address: "",
      procedure: {}
    };
  },
  created() {
    this.getData();
  },
  computed: {
    kernel() {
      return this.$kernels()[this.$route.params.id];
    },
    path() {
      const kernel = this.kernel;
      const name = this.name;

      return [
        {
          text: String(kernel.name),
          to: { name: "k_procedures", replace: true }
        },
        { text: String(name) }
      ];
    }
  },
  methods: {
    async getData() {
      const kernel = this.kernel.instance;
      const kernelAddr = kernel.options.address;
      const web3 = this.$web3();

      this.name = this.$route.params.procedureId;
      this.procedure = this.kernel.procedures[this.name];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.procedure h5 {
  padding: 2rem 0 0;
}
.procedure .table-hover tbody tr:hover {
  cursor: pointer;
}

.procedure header.top {
  padding: 2rem 0 1rem;
}

.procedure header.top .details {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #9a9a9a;
}
</style>
