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
            <b-tab title="Blank project" active>
              <b-form class="basic" @submit="createOrg" @reset="onReset">
                <b-form-row>
                  <b-col cols="6">
                    <b-form-group label="Project Path" label-for="project_path">
                      <b-form-input id="project_path" type="text" v-model="path" placeholder="https://daolab.io/" />
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
                <!-- <b-form-input type="password" v-if="selected_account" v-model="password" placeholder="Account Password" /> -->
                <b-button type="submit" variant="primary">Create</b-button>
                <b-button type="reset" variant="danger">Reset</b-button>

                <p v-if="done"> Created </p>
              </b-form>
            </b-tab>
            <b-tab title="Create from template"></b-tab>
            <b-tab title="Import project"></b-tab>
          </b-tabs>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  name: "NewProject",
  data() {
    return {
      path: 'https://daolab.io/',
      name: '',
      description: '',
      visibility: ''
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

header, .options {
  padding-top: 2rem;
}
.options {
  
}

.radio-group .choice{
  margin-bottom: 1rem;
}
.radio-group h6, .radio-group p {
  position: relative;
  left: 20px;
  top: 2px;
  margin: 0;
}
.radio-group i {
  position: absolute;
  left: -20px;
}
.basic {
  margin-top: 2rem;
}
</style>
