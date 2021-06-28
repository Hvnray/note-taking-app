import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

import { auth } from "../firebase";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/notes",
    name: "Note App",
    // component: Note,
    component: () => import("../views/Note.vue"),
    meta: { loginRequired: true },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});
router.beforeEach((to, _, next) => {
  const authRequired = to.meta?.loginRequired;
  const isAuthenticated = auth.currentUser;
  const isUsefulRoute = routes.every((b) => b.path !== to.path);
  if (isUsefulRoute || (authRequired && !isAuthenticated)) {
    next("/");
  } else {
    next();
  }
});
export default router;
