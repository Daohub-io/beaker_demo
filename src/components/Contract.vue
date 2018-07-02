<template>
  <div class="contract">
    <header>
      <b-container>
        <b-row>
          <b-col>
            <h4> {{ owner }} / {{ name }}</h4>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
             <b-nav class="sub_bar" tabs>
                <b-nav-item :to="{name: 'contract'}" exact>State</b-nav-item>
                <b-nav-item :to="{name: 'contract-requests'}">Requests</b-nav-item>
                <b-nav-item :to="{name: 'contract-actors'}">Actors</b-nav-item>
                <b-nav-item :to="{name: 'contract-tx'}">Transactions</b-nav-item>
                <b-nav-item :to="{name: 'contract-metrics'}">Metrics</b-nav-item>
                <b-nav-item :to="{name: 'contract-network'}">Network</b-nav-item>
                <b-nav-item :to="{name: 'contract-settings'}">Settings</b-nav-item>
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
  name: "Contract",
  data() {
    let {owner, contract } = this.$route.params;

    return { owner, name: contract };
  },
  computed: {
  },
  methods: {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

header {
  background-color: #ddd;
  padding-top: 2rem;
  padding-bottom: 0;
}

header h4 {
  margin: 0 0 1rem 0;
}
</style>
