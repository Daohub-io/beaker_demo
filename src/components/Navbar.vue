<template>
<b-navbar toggleable variant="dark" type="dark" class="daolab-navbar">
    <b-container>
        <b-navbar-brand>Daolab</b-navbar-brand>
        <b-navbar-nav class="links">
            <b-nav-form class="search-bar">
                <b-form-input :state="null" type="text" placeholder="Search contracts.."/>
            </b-nav-form>
            <b-nav-item to="/">Transactions</b-nav-item>
            <b-nav-item to="/">Actions</b-nav-item>
            <b-nav-item to="/">Apps</b-nav-item>
            <b-nav-item to="/">Network</b-nav-item>
            <b-nav-item to="/">Explore</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
            <b-nav-item class="notification">
                <i class="fas fa-bell"></i>
            </b-nav-item>
            <b-nav-item-dropdown right>
                <template slot="button-content">
                    <b-img rounded="circle" blank width="30" height="30" :blank-color="color"/>
                </template>
                <b-dropdown-item href="#">Profile</b-dropdown-item>
                <b-dropdown-item href="#">Logout</b-dropdown-item>
            </b-nav-item-dropdown>
        </b-navbar-nav>
    </b-container>
</b-navbar>
</template>

<script>
import Vue from 'vue'

export default {
  name: "Navbar",
  data() {
    let user = Vue.currentUser();
    return {
        color: user.color
    };
  },
  computed: {}
};
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
    background-color: rgba(255,255,255,0.1);
    color: #fff;
    font-size: 0.9rem;
    border: 1px solid #999;
}
.notification img {
    width: 20px;
    fill:  #fff;
}

</style>
