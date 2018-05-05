<template>
  <div class="orders">
      <b-container>
        <b-row>
          <b-col cols="2">
            <header class="top">
              <b-btn v-b-modal.modalCreateOrder size="sm">New Order</b-btn>
              <b-modal id="modalCreateOrder" ref="modal" title="New Order" @ok="createOrder">
                <form>
                  <label class="mr-sm-2" for="inlineFormCustomSelectPref">Type</label>
                  <b-form-input v-model="order.name" placeholder="Order Name"></b-form-input>
                </form>
              </b-modal>
            </header>
          </b-col>
        </b-row>
        <b-row>
            <b-col cols="12">
                <b-table 
                  :items="orders"
                  :fields="fields"
                  :hover="true"
                  :small="true"
                  @row-clicked="viewAction">
                </b-table>
            </b-col>
        </b-row>
      </b-container>
  </div>
</template>

<script>
export default {
  name: "Orders",
  data() {
    return {
      order: {
        name: ''
      },
      orders: [],
      fields: [
        'name'
      ],
      error: false
    };
  },
  computed: {
    kernel() {
      return this.$kernels()[this.$route.params.id];
    },
    listActions() {
      const kernel = this.$kernels()[this.$route.params.id];
      
      const d = Object.entries(kernel.procedures).map(([name, prop]) => {
          return prop.abi.map(action => ({name: action.name}))
      }).flatten()

      return d
    }
  },
  methods: {
    viewAction(item) {
      
    },
    createOrder() {
      this.orders.push({ name: this.order.name});
      this.order.name = '';
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>


.orders .table-hover tbody tr:hover {
  cursor: pointer;
}

.orders header.top {
  padding: 2rem 0 1rem;
}

.orders header.top .details {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #9a9a9a;
}
</style>
