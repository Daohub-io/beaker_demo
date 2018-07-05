<template>
  <div class="new-project">
    <b-container>
      <b-row>
        <b-col cols="4">
          <header>
            <h3>New Project</h3>
            <p>A Project is where you can manage your contract code, access requests and other features of Daolab.</p>
          </header>
        </b-col>
        <b-col cols="8">
          <b-tabs class="options">
            <b-tab title="Blank project" class="blank">
              <b-form class="basic" @reset="onReset" novalidate>
                <b-form-row>
                  <b-col cols="6">
                    <b-form-group label="Project Path" label-for="project_path">
                      <b-form-input id="project_path" type="text" :value ="path" placeholder="https://daolab.io/" readonly/>
                    </b-form-group>
                  </b-col>
                  <b-col cols="6">
                    <b-form-group label="Project name" label-for="project_name">
                      <b-form-input id="project_name" type="text" v-model="name" placeholder="my-awesome-project" />
                    </b-form-group>
                  </b-col>
                </b-form-row>
                <b-form-group label="Project Description" label-for="project_desc">
                  <b-form-textarea id="project_desc" type="text" v-model="description" placeholder="Description format" />
                </b-form-group>
                <b-form-group label="Visibility Level">
                  <b-form-radio-group v-model="visibility" class="radio-group" stacked>
                    <b-form-radio class="choice" value="private">
                      <h6><i class="fas fa-lock"></i>Private</h6>
                      <p>Project access must be granted for each user </p>
                    </b-form-radio>
                     <b-form-radio class="choice" value="shared">
                      <h6><i class="fas fa-link"></i>Shared</h6>
                      <p>Project can be accessed by private link</p>
                    </b-form-radio>
                     <b-form-radio class="choice" value="public">
                      <h6><i class="fas fa-globe-americas"></i>Public</h6>
                      <p>Project can be accessed and found online without registration</p>
                    </b-form-radio>
                  </b-form-radio-group>
                </b-form-group>
                <b-button variant="primary" @click="createProject">Create</b-button>
                <b-button type="reset" variant="danger">Reset</b-button>
              </b-form>
            </b-tab>
            <b-tab title="Create from template" class="template">
              <ul class="list-unstyled">
                <b-media tag="li">
                  <h5>Simple Token</h5>
                  <p>A simple template including an erc20 compatible token</p>
                  <b-button>Use Template</b-button>
                </b-media>
                <b-media tag="li">
                  <h5>Membership System</h5>
                  <p>A template including a root with a membership system</p>
                  <b-button>Use Template</b-button>
                </b-media>
              </ul>
            </b-tab>
            <b-tab title="Import project" class="import">
              <b-form>
                <b-form-group label="Import project from" label-for="project_import">
                  <b-button>Daolab</b-button>
                  <b-button>Github</b-button>
                  <b-button>Gitlab</b-button>
                  <b-button>By Url</b-button>
                </b-form-group>
              </b-form>
            </b-tab>
          </b-tabs>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "NewProject",
  data() {
    let owner = Vue.$currentUser().name.toLowerCase();
    return {
      owner,
      name: "",
      description: "",
      visibility: "private"
    };
  },
  computed: {
    path() {
      return `https://daolab.io/${this.owner}/${this.name}`;
    }
  },
  methods: {
    createProject() {
      const { owner, name, description, visibility } = this;

      Vue.$newProject(name, description, visibility);

      this.$router.replace({
        name: "contract",
        params: { owner, contract: name }
      });
    },
    onReset() {
      this.owner = "user";
      this.name = "";
      this.description = "";
      this.visibility = "private";
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
header,
.options {
  padding-top: 2rem;
}

.blank,
.template,
.import {
  padding-top: 2rem;
}

.blank .radio-group .choice {
  margin-bottom: 1rem;
}
.blank .radio-group h6,
.radio-group p {
  position: relative;
  left: 20px;
  top: 2px;
  margin: 0;
}
.blank .radio-group i {
  position: absolute;
  left: -20px;
}

.template li {
  margin-bottom: 1rem;
}
</style>
