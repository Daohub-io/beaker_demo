<template>
<b-nav vertical variant="dark" type="dark" class="daolab-dev-tool">
    <h5>Dev Tools</h5>
    <b-nav-item>Refresh</b-nav-item>
</b-nav>
</template>

<script>
import Vue from "vue";

export default {
  name: "Navbar",
  data() {
    let user = Vue.$currentUser();
    return {
      color: user.color,
      name: user.name
    };
  },
  computed: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.daolab-dev-tool {
    width: 300px;
    height: 100%;
    background-color: #a5a5a5;
    box-shadow: inset 0 0 5px 0px #333;
    padding: 1rem;
}

.daolab-dev-tool h5 {

}
</style>
