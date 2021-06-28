<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <!-- <img alt="Vue logo" src="../assets/logo.png" /> -->
      <h1 class="md-display-3">Note Book App</h1>
      <!-- <h3 class="md-title">Login to start taking notes</h3> -->
      <Login />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import Login from "@/components/Login.vue";

export default {
  name: "Home",
  components: {
    // HelloWorld,
    Login,
  },
  mounted() {
    console.log(this.$firebase, "check firebase");
    console.log(this.$auth, "check auth");
    console.log(this.$db, "check db");
    console.log(this, "check this");
  },
};
</script>

<style lang="css" scoped>
.md-layout {
  height: 100vh;
  justify-content: center;
  align-items: baseline;
  padding-top: 5rem;
  /* &:nth-child(1) {
      background: md-get-palette-color(grey, 300);
    }

    &:nth-child(2) {
      background: md-get-palette-color(grey, 400);
    }

    &:nth-child(3) {
      background: md-get-palette-color(grey, 500);
    } */
}
</style>
