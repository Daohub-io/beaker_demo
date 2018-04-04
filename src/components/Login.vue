<template>
  <div class="login">
    <b-container>
      <b-row>
          <b-col cols="3" align="center">
            <form>
                <b-form-input type="text" placeholder="Username" v-model="username"></b-form-input>
                <b-form-input type="email" placeholder="Email" v-model="email"></b-form-input>
                <b-form-input type="password" placeholder="Password" v-model="password"></b-form-input>
                <b-button @click="loginUser">Login</b-button>
            </form>
          </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      username: "",
      email: "",
      password: ""
    };
  },
  methods: {
    // Fake Login
    loginUser() {
      setTimeout(() => {

      }, 1500);
    }
  },
  computed: {
    // See http://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#properties
    organizations() {
      let kernels = this.$kernels();
      let web3 = this.$web3();

      return Array.from(kernels).map(([address, { name }]) => {
        return {
          name,
          address,
          balance: 0
        };
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login form {
}
</style>
