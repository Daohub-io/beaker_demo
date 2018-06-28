<template>
  <div class="list">
    <b-container>
        <b-row>
            <b-col cols=4>
                <header>
                    <h3>Welcome to Daolab</h3>
                </header>
            </b-col>
        </b-row>
      <ul class="choices">
          <b-row>
              <b-col>
                  <b-card-group deck>
                      <b-card no-body class="choice">
                        <b-card-body>
                            <h4><i class="fas fa-book"></i> Create a Project</h4>
                            <p class="card-text">
                                Project are where you can store your code, access requests, deploy your contract and other features of Daolab
                            </p>
                        </b-card-body>
                      </b-card>
                      <b-card no-body class="choice">
                        <b-card-body>                        
                            <h4><i class="fas fa-people"></i> Create a Group</h4>
                            <p class="card-text">
                                Group are the best way to manage projects and members
                            </p>
                        </b-card-body>
                      </b-card>
                  </b-card-group>
              </b-col>
          </b-row>
          <b-row>
              <b-col>
                  <b-card-group deck>
                      <b-card no-body>
                        <b-card-body>
                            <h4><i class="fas fa-search"></i> Explore public projects</h4>
                            <p class="card-text">
                                There are 132 publicly listed projects on this server.
                            </p>
                        </b-card-body>
                      </b-card>
                      <b-card no-body>
                        <b-card-body>
                            <h4><i class="fas fa-question"></i> Learn more about Daolab</h4>
                            <p class="card-text">
                                Take a look at our documentation to discover all of Daolab’s features.
                            </p>
                        </b-card-body>
                      </b-card>
                  </b-card-group>
              </b-col>
          </b-row>
      </ul>

    </b-container>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {};
  },
  computed: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

header {
    padding: 2rem 0;
}
.choice {
    margin-bottom: 1rem;
}

ul.choices {
    padding: 0;
}
.choice i {
    margin: auto 0;
}
</style>
