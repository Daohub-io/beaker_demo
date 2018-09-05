<template>
  <div id="app">
    <div class="content">
    <Navbar></Navbar>
      <router-view/>
    </div>
  </div>
</template>

<script>

// Import Bootstrap
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import Navbar from '@/components/Navbar'
import DevTool from '@/components/DevTool'

export default {
  name: "App",
  data() {
    return {};
  },
  components: { Navbar },
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
  padding: 0;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
}

.content {
  display: flex;
  flex-direction: column;
}
</style>
