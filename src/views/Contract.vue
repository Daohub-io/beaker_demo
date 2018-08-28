<template>
  <div class="contract">
    <header>
      <b-container>
        <b-row>
          <b-col>
            <h4>
              <router-link :to="{name: 'account', params: { account: owner }}">{{ owner }}</router-link> / 
              <router-link :to="{name: 'contract', params: { owner, name }}">{{ name }}</router-link>
            </h4>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
             <b-nav class="sub-bar" tabs>
                <b-nav-item :to="{name: 'contract'}" exact><i class="fas fa-book"></i> State</b-nav-item>
                <b-nav-item :to="{name: 'contract-transactions'}"><i class="fas fa-edit"></i> Transactions </b-nav-item>
                <b-nav-item :to="{name: 'contract-actors'}"><i class="fas fa-bolt"></i> Actors</b-nav-item>
                <b-nav-item :to="{name: 'contract-metrics'}"><i class="fas fa-chart-bar"></i> Metrics</b-nav-item>
                <b-nav-item :to="{name: 'contract-network'}"><i class="fas fa-broadcast-tower"></i> Network</b-nav-item>
                <b-nav-item :to="{name: 'contract-settings'}"><i class="fas fa-cog"></i> Settings</b-nav-item>
            </b-nav>
          </b-col>
        </b-row>
      </b-container>
    </header>
    <router-view/>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "Contract",
  data() {
    let {owner, contract } = this.$route.params;
    return { owner, name: contract };
  },
  beforeMount() {
    let {owner, contract } = this.$route.params;
    let user = Vue.$currentUser()
    if (user.name.toLowerCase() != owner.toLowerCase() || !user.projects.has(contract)) return this.$router.push({path: '/404'});
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

ul.sub-bar >>> li a {
  color: rgb(56, 56, 56);
}
ul.sub-bar >>> li a i {
  color: rgb(150, 150, 150);
}

ul.sub-bar >>> li a.active {
  color: #333;
}
ul.sub-bar >>> li a.active i {
  color: #333;
}
</style>
