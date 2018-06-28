<template>
  <div class="instance">
    <header>
      <b-container>
        <b-row>
          <b-col>
            <h4>{{ kernel.name }}</h4>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
             <b-nav class="sub_bar" tabs>
                <b-nav-item :to="{name: 'k_storage'}" exact>Storage</b-nav-item>
                <b-nav-item :to="{name: 'k_orders'}">Orders</b-nav-item>
                <b-nav-item :to="{name: 'k_procedures'}">Procedures</b-nav-item>
            </b-nav>
          </b-col>
        </b-row>
      </b-container>
    </header>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "Instance",
  data() {
    let id = this.$route.params.instance;

    return {};
  },
  mounted() {
    this.getData();
  },
  computed: {
    kernel() {
      return this.$kernels()[this.$route.params.id];
    },
    routeName() {
      return this.$route.name
    }
  },
  methods: {
    async getData() {
      let web3 = this.$web3();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.org header {
  background-color: #ddd;
  padding-top: 1rem;
  padding-bottom: 0;
}

.org h4 {
  margin: 0 0 1rem 0;
}
</style>
