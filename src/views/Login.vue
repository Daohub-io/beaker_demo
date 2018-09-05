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
      this.$login(this.username)
      this.$router.push('/')
    }
  },
  computed: {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login form {
}
</style>
