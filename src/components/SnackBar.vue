<template>
  <md-snackbar
    :md-active.sync="showSnackbar"
    md-persistent
    :md-duration="Infinity"
  >
    <span>{{ message }}</span>
    <md-button class="md-accent" @click="$emit('close')">close</md-button>
  </md-snackbar>
</template>

<script>
export default {
  props: {
    showSnackbar: {
      type: Boolean,
    },
    message: {
      type: String,
      default: "",
      // required: true,
      // validator: function (value) {
      //   return value >= 0;
      // },
    },
  },
};
</script>

<style lang="css" scoped>
.md-snackbar {
  margin-bottom: 20px !important;
}
</style>
