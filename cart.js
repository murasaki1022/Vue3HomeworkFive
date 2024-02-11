//驗證規則
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const apiUrl = `https://vue3-course-api.hexschool.io`;
const apiPath = `langyuanstore`;

const userModal = {
  props: ["tempProduct", "addCart", "status"],
  data() {
    return {
      productModal: null,
      qty: 1,
    };
  },
  template: "#userProductModal",
  methods: {
    open() {
      this.productModal.show();
    },
    close() {
      this.productModal.hide();
    },
  },
  watch: {
    tempProduct() {
      this.qty = 1;
    },
  },
  mounted() {
    this.productModal = new bootstrap.Modal(this.$refs.modal);
  },
};

const app = Vue.createApp({
  data() {
    return {
      isLoading: true,
      products: [],
      tempProduct: {},
      carts: {},
      status: {
        addCartLoading: "",
        changeCartNumLoading: "",
      },
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
    };
  },
  methods: {
    getProduct() {
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/products/all`)
        .then((res) => {
          this.products = res.data.products;
          this.isLoading = false;
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    openModal(product) {
      this.tempProduct = product;
      this.$refs.userModal.open();
    },
    getCart() {
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/cart`)
        .then((res) => {
          this.carts = res.data.data;
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    addCart(product_id, qty = 1) {
      const order = {
        product_id,
        qty,
      };
      this.status.addCartLoading = product_id;
      axios
        .post(`${apiUrl}/v2/api/${apiPath}/cart`, { data: order })
        .then((res) => {
          this.status.addCartLoading = "";
          Swal.fire(res.data.message);
          this.$refs.userModal.close();
          this.getCart();
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    changeCartNum(item, qty = 1) {
      const order = {
        product_id: item.product_id,
        qty,
      };
      this.status.changeCartNumLoading = item.id;
      axios
        .put(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`, { data: order })
        .then((res) => {
          this.status.changeCartNumLoading = "";
          this.getCart();
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    deleteCartItem(id) {
      Swal.fire({
        title: "確定刪除該品項?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "確定刪除",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .delete(`${apiUrl}/v2/api/${apiPath}/cart/${id}`)
            .then((res) => {
              this.getCart();
            })
            .catch((err) => {
              console.log(err.data.message);
            });
          Swal.fire({
            title: "已刪除成功",
            icon: "success",
          });
        }
      });
    },
    deleteCartAll() {
      Swal.fire({
        title: "確定清空購物車?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "確定",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .delete(`${apiUrl}/v2/api/${apiPath}/carts`)
            .then((res) => {
              this.getCart();
              Swal.fire({
                title: "已清空購物車",
                icon: "success",
              });
            })
            .catch((err) => {
              Swal.fire({
                icon: "error",
                title: err.data.message,
              });
            });
        }
      });
    },
    onSubmit() {
      const userOrder = this.form;
      axios
        .post(`${apiUrl}/v2/api/${apiPath}/order`, { data: userOrder })
        .then((res) => {
          Swal.fire(res.data.message);
          this.$refs.form.resetForm();
          this.getCart();
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: err.data.message,
          });
        });
    },
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value)
        ? true
        : "請輸入09開頭，共10碼的正確的電話號碼";
    },
  },
  components: {
    userModal,
  },
  mounted() {
    this.getProduct();
    this.getCart();
  },
});
app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);
app.component("loading", VueLoading.Component);
app.mount("#app");
