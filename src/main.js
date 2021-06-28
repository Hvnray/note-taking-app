import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueMaterial from "vue-material";
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";

//import firabse instance attach it globallyy to vue instance
import { firebase, auth, db } from "./firebase";

Vue.prototype.$firebase = firebase;
Vue.prototype.$auth = auth;
Vue.prototype.$db = db;

Vue.use(VueMaterial);
Vue.config.productionTip = false;

let app;
// check firebase auth state before component mounts
auth.onAuthStateChanged(() => {
  if (!app) {
    app = new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount("#app");
  }
});
