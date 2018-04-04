<template>
  <div class="hello">
    <b-container>
      <b-row align-h="center">
        <b-col cols="4">
          <b-form class="basic" @submit="createOrg" @reset="onReset">
            <h2>Create an Organization</h2>
            <b-form-input type="text" v-model="name" placeholder="Name" />
            <b-form-select v-model="selected_account" :options="accounts" class="mb-3" placeholder="Account"/>
            <!-- <b-form-input type="password" v-if="selected_account" v-model="password" placeholder="Account Password" /> -->
            <b-button type="submit" variant="primary">Create</b-button>
            <b-button type="reset" variant="danger">Reset</b-button>

            <p v-if="done"> Created </p>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  name: "CreateOrg",
  data() {
    return {
      selected_account: false,
      password: "",
      accounts: [],
      name: "",
      done: false,
    };
  },
  mounted() {
    this.accounts = this.$accounts()
  },
  methods: {
    async createOrg() {
      let account = this.selected_account
      let name = this.name
      let password = this.password;

      try {
        let instance = await this.$createKernel({name, account, password });
        // Update Frontend
        this.done = true;
      } catch (e) {
        console.error(e)
      }
    },
    onReset() {
      this.name = ''
      this.done = false
      this.selected_account = false
      this.password = false
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.basic {
  margin-top: 2rem;
}
</style>
