<template>
  <div id="app">
    <div class="content">
      <router-view/>
    </div>
  </div>
</template>

<script>

// Import Bootstrap
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

export default {
  name: "App",
  data() {
    return {};
  },
  created() {},
  methods: {}
}
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app,
.content {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0 !important;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.content {
  display: flex;
  flex-direction: column;
}
</style>
