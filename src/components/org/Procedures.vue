<template>
  <div class="procedures">
      <b-container>
        <b-row>
          <b-col> 
            <nav class="tools">
              <b-btn v-b-modal.modalCreateProc size="sm"> Create New Procedure </b-btn>
              <b-modal id="modalCreateProc" ref="modal" title="Create Procedure" @ok="createProcedure">
                <form>
                  <label class="mr-sm-2" for="inlineFormCustomSelectPref">Type</label>
                  <b-form-textarea id="textarea1"
                              v-model="procedure.abi"
                              placeholder="Enter new Procedure ABI"
                              :rows="3"
                              :max-rows="100">
                  </b-form-textarea>
                  <b-form-input v-model="procedure.name" placeholder="Enter new Procedure Name"></b-form-input>
                  {{ status }}
                </form>
              </b-modal>
            </nav>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-table :items="procedures" @row-clicked="viewProcedure" hover></b-table>
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
      procedures: [],
      procedure: {
        name: "",
        abi: "",
      },
      status: "off"
    };
  },
  mounted() {
    this.getData();
  },
  computed: {
    kernel() {
      return this.$kernels()[this.$route.params.id];
    }
  },
  methods: {
    async createProcedure() {
      const instance = this.kernel.instance;
      const web3 = this.$web3();
      const account = this.$accounts()[1];

      const procedure = this.procedure
      try {
        this.status = "running";

        await this.$createProcedure({kernel: instance, procedure})
        this.$saveProcedure(kernelAddr, procedure)

      } catch (e) {
        console.error(e);
        this.status = "error";
        return;
      }
      this.status = "finished";
      this.getData();
    },
    async getData() {
      let web3 = this.$web3();
      const instance = this.kernel.instance;

      const raw = await instance.methods.listProcedures().call();
      const procedures = raw
        .map(web3.utils.toAscii)
        .map(s => s.replace(/\0.*$/, ""))
        .map(name => ({ name }));

      for (const i in procedures) {
        const address = await instance.methods
          .getProcedure(web3.utils.toHex(procedures[i].name))
          .call();
        procedures[i].address = address;
      }

      this.procedures = procedures;
    },
    viewProcedure(item) {
      this.$router.push({ path: `procedure/${item.name}` });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.procedures .tools {
  padding: 1rem 0;
}
.procedures .table-hover tbody tr:hover {
  cursor: pointer;
}
</style>
