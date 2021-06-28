<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <h1 class="md-display-3">Note Book App</h1>
      <Login />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Login from "@/components/Login.vue";

export default {
  name: "Home",
  components: {
    // HelloWorld,
    Login,
  },
};
</script>

<style lang="css" scoped>
.md-layout {
  height: 100vh;
  justify-content: center;
  align-items: baseline;
  padding-top: 5rem;
}
</style>
