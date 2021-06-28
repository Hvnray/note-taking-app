<template>
  <md-card>
    <md-card-header>
      <md-card-header-text>
        <div class="md-title t-start">{{ currentNote.title }}</div>
        <div class="md-subhead t-start">
          {{ toDateTime(currentNote.timestamp) }}
        </div>
      </md-card-header-text>

      <md-button
        class="md-icon-button md-primary"
        @click="$emit('edit-card-click', currentNote)"
      >
        <md-icon>edit</md-icon>
      </md-button>
    </md-card-header>

    <md-card-content class="t-start">
      {{ currentNote.content }}
    </md-card-content>

    <md-card-actions md-alignment="right">
      <md-button
        class="md-icon-button md-accent"
        @click="$emit('delete-card-click', currentNote)"
      >
        <md-icon>delete</md-icon>
      </md-button>
    </md-card-actions>
    <md-card-content class="labels t-start">
      {{ computedLabels }}
    </md-card-content>
  </md-card>
</template>

<script>
export default {
  name: "NoteCard",
  props: {
    currentNote: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    computedLabels() {
      return this.currentNote.labels?.map((b) => b.text).join(", ");
    },
  },
  methods: {
    toDateTime(timestamp) {
      return timestamp?.toDate().toLocaleString("en-US", { hour12: true });
    },
  },
};
</script>

<style lang="css" scoped>
.t-start {
  text-align: start;
}
.labels {
  height: auto;
  color: white;
  background: orange;
  width: 100%;
  font-size: 16px;
  padding: 12px;
  text-transform: capitalize;
  min-height: 2.8rem;
}
</style>
