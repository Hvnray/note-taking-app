<template>
  <div id="navbarDiv">
    <h3 class="md-title f-title">Note Taking App</h3>
    <div class="filterinput">
      <md-field>
        <md-input
          md-layout="box"
          v-model="search"
          placeholder="search notes..."
        />
        <md-icon>search</md-icon>
      </md-field>
    </div>
    <p class="md-title t-title">
      <small>welcome {{ email || "" }}</small>
    </p>
    <md-button class="md-accent md-raised" @click="$emit('signOut')"
      >Log out</md-button
    >
  </div>
</template>

<script>
export default {
  name: "Navbar",
  props: {
    email: String,
    value: {
      type: String,
      default: "",
    },
  },
  watch: {
    search(newVal) {
      this.$nextTick(() => {
        this.$emit("input", newVal);
      });
    },
    value: {
      handler(newVal) {
        if (!newVal) {
          this.search = "";
          return;
        }
        this.search = newVal;
      },
      immediate: true,
    },
  },
  data() {
    return {
      search: "",
    };
  },
};
</script>

<style lang="css" scoped>
#navbarDiv {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.md-field {
  width: 50ch;
}
.f-title {
  flex: 1;
  text-align: start;
}
.t-title {
  text-align: end;
  padding: 0 42px;
}
.filterinput {
  flex: 1;
  color: white;
}
</style>
