<template>
<b-navbar toggleable variant="dark" type="dark" class="daolab-navbar">
    <b-container>
        <b-navbar-brand href="/">Demo</b-navbar-brand>
        <!-- <b-navbar-nav class="links">
            <b-nav-form class="search-bar">
                <b-form-input :state="null" type="text" placeholder="Search contracts.."/>
            </b-nav-form>
            <b-nav-item to="/">Transactions</b-nav-item>
            <b-nav-item to="/">Actions</b-nav-item>
            <b-nav-item to="/">Apps</b-nav-item>
            <b-nav-item to="/">Network</b-nav-item>
            <b-nav-item to="/">Explore</b-nav-item>
        </b-navbar-nav> -->
        <slot name="context">
            <b-navbar-nav class="ml-auto" v-if="username">
                <b-nav-item class="notification">
                    <i class="fas fa-bell"></i>
                </b-nav-item>
                <b-nav-item-dropdown right>
                    <template slot="button-content">
                        <b-img blank rounded="circle" class="user-icon" width="30" height="30" :blank-color="color" :alt="username"/>
                    </template>
                    <b-dropdown-item href="#">Profile</b-dropdown-item>
                    <b-dropdown-item href="#">Logout</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>
            <b-navbar-nav class="ml-auto" v-else>
                <b-nav-item class="no-user">
                    <b-button>Login</b-button>
                    <b-button>Sign up</b-button>
                </b-nav-item>
            </b-navbar-nav>
        </slot>
    </b-container>
</b-navbar>
</template>

<script>
import Vue from "vue";
import { mapState, mapGetters } from 'vuex'
export default {
  name: "Navbar",
  data() {
    return {};
  },
  computed: {
      ...mapGetters('account', ['color']),
      ...mapState('account', ['username'])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.daolab-navbar {
  background-color: #fff;
}

.links li a {
  font-size: 0.9rem;
}

.search-bar input {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.9rem;
  border: 1px solid #999;
}

.user-icon {
  fill: #fff;
  display: inline-block;
  width: 30px;
  height: 30px;
  color: #333;
}

.no-user >>> button:first-child {
    margin-right: 5px;
}
</style>
