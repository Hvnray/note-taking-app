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
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/About.vue"),
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
  if (authRequired && !isAuthenticated) {
    next("/");
  } else {
    next();
  }
});
export default router;
