<template>
  <div class="dev">
    <Navbar>
      <template slot="context">
        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <b-btn v-b-modal.modalConnection size="sm" :variant="connected ? 'success': 'danger'">{{ connected ? 'Connected': 'No Connection'}}</b-btn>
            <b-modal id="modalConnection" ref="modal" title="Set Connection" @ok="handleOk">
              <form @submit.stop.prevent="handleOk">
                <p>Network Id: {{ network.node.id }}</p>
                <p>Type: {{ network.node.type }} </p>
                <b-form-input type="text" placeholder="Enter Node Address" v-model="address"></b-form-input>
              </form>
            </b-modal>
          </b-nav-form>
        </b-navbar-nav>
      </template>
    </Navbar>
    <b-container>
      <b-row>
          <b-col cols="3" align="center">
            Development
            
          </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import { web3 } from "@/web3";

export default {
  name: "Dev",
  data() {
    this.connect();
    return {
      address: ""
    };
  },
  components: { Navbar },
  methods: {
    async connect(address) {
      return this.$store.dispatch("network/connect");
    },
    async handleOk() {
      await this.connect();
      this.$refs.modal.hide();
    },
  },
  computed: {
    network() {
      return this.$store.state.network;
    },
    connected() {
      return this.network.accounts.length !== 0;
    },
    version() {
      return web3.version.node
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dev {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
