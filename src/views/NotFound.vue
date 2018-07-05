<template>
  <div>
    <b-container>
      <b-row>
          <b-col cols="12" align="center" class="not-found">
            <h4>404</h4>
            <p>Not Found</p>
          </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "NotFound",
  data() { 
    return {};
  },
  methods: {
  },
  computed: {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.not-found {
    padding: 5rem 0 0 0;
}
</style>
