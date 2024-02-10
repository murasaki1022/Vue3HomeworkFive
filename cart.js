const apiUrl = `https://vue3-course-api.hexschool.io`;
const apiPath = `langyuanstore`;

const userModal = {
  props: ["tempProduct"],
  data() {
    return {
      productModal: null,
    };
  },
  template: "#userProductModal",
  methods: {
    open() {
      this.productModal.show();
    },
  },
  mounted() {
    this.productModal = new bootstrap.Modal(this.$refs.modal);
  },
};

const app = Vue.createApp({
  data() {
    return {
      products: [],
      tempProduct: {},
    };
  },
  methods: {
    getProduct() {
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/products/all`)
        .then((res) => {
          this.products = res.data.products;
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    openModal(product) {
      this.tempProduct = product;
      this.$refs.userModal.open();
    },
  },
  components: {
    userModal,
  },
  mounted() {
    this.getProduct();
  },
});

app.mount("#app");
