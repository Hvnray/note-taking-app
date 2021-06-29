.
<template>
  <div>
    <md-toolbar class="md-transparent" md-elevation="0">
      Labels Quick Access
    </md-toolbar>

    <md-list>
      <md-list-item @click="$emit('label-selected', { text: 'ALL' })">
        <md-icon>tag</md-icon>
        <span class="md-list-item-text">ALL</span>
      </md-list-item>
      <md-list-item
        v-for="(label, i) in sortedLabels"
        :key="i"
        @click="$emit('label-selected', label)"
      >
        <md-icon>tag</md-icon>
        <span class="md-list-item-text">{{ label.text || "" }}</span>
      </md-list-item>
    </md-list>
  </div>
</template>

<script>
export default {
  name: "Drawer",
  props: {
    labels: { type: Array, default: () => [] },
  },
  computed: {
    sortedLabels() {
      const { labels } = this;
      return labels.sort((a, b) => a.text.localeCompare(b.text));
    },
  },
};
</script>

<style lang="css" scoped>
.md-list-item {
  cursor: pointer;
}
.md-list-item-text {
  text-transform: capitalize;
}
</style>
