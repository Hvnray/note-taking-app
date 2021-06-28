<template>
  <md-dialog
    class="padding"
    :md-active.sync="showDialog"
    :md-click-outside-to-close="false"
    @md-clicked-outside="$emit('close-dialog')"
  >
    <md-dialog-title>{{
      isCreateMode ? "New Note" : "Edit Note"
    }}</md-dialog-title>

    <md-card class="padding">
      <form novalidate @submit.prevent="validateUser">
        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-size-100">
              <md-field :class="getValidationClass('title')">
                <label for="title">Title</label>
                <md-input
                  name="title"
                  id="title"
                  md-counter="20"
                  v-model="form.title"
                  :disabled="sending"
                />
                <span class="md-error" v-if="!$v.form.title.required"
                  >The title is required</span
                >
                <span class="md-error" v-else-if="!$v.form.title.minlength"
                  >title should be atleast 1 character</span
                >
                <span class="md-error" v-else-if="!$v.form.title.maxlength"
                  >title should be atmost 20 characters</span
                >
              </md-field>
            </div>

            <div class="md-layout-item md-size-100">
              <md-field :class="getValidationClass('content')">
                <label for="content">Content</label>
                <md-textarea
                  name="content"
                  id="content"
                  md-counter="100"
                  v-model="form.content"
                  :disabled="sending"
                />
                <span class="md-error" v-if="!$v.form.content.required"
                  >The content is required</span
                >
                <span class="md-error" v-else-if="!$v.form.content.minlength"
                  >content should be atleast 1 character</span
                >
                <span class="md-error" v-else-if="!$v.form.content.maxlength"
                  >content should be atmost 100 characters</span
                >
              </md-field>
            </div>

            <div class="md-layout-item md-size-100">
              <label>Add Labels</label>
              <vue-tags-input
                v-model="label"
                :tags="addedLabels"
                allow-edit-tags
                :autocomplete-min-length="0"
                :max-tags="5"
                placeholder="Add label"
                :maxlength="10"
                :autocomplete-items="filteredItems"
                @tags-changed="(newTags) => (addedLabels = newTags)"
              />
              <small
                >add multiple labels by selecting from list and /or hit enter to
                add new tag</small
              >
            </div>
          </div>
          <md-progress-bar md-mode="indeterminate" v-if="sending" />
        </md-card-content>
        <md-card-actions>
          <md-button class="md-accent" @click="$emit('close-dialog')"
            >Close</md-button
          >
          <md-button type="submit" class="md-primary" :disabled="sending"
            >Submit</md-button
          >
        </md-card-actions>
      </form>
    </md-card>
    <snack-bar
      :showSnackbar="opensnackbar"
      :message="errorMessage"
      @close="opensnackbar = false"
    />
  </md-dialog>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required, minLength, maxLength } from "vuelidate/lib/validators";
import { auth, db as fireStoreDb, firebase } from "../../firebase";
import VueTagsInput from "@johmun/vue-tags-input";
import SnackBar from "@/components/SnackBar";
const testData = [
  {
    text: "Spain",
  },
  {
    text: "France",
  },
  {
    text: "USA",
  },
  {
    text: "Germany",
  },
  {
    text: "China",
  },
];
export default {
  name: "Login",
  components: {
    "snack-bar": SnackBar,
    VueTagsInput,
  },
  props: {
    isCreateMode: {
      type: Boolean,
      default: true,
    },
    showDialog: {
      type: Boolean,
      default: false,
    },
    labels: {
      type: Array,
      default: () => [],
    },
    currentData: {
      type: Object,
      default: () => ({}),
    },
  },
  mixins: [validationMixin],
  computed: {
    filteredItems() {
      return this.labels?.length === 0
        ? []
        : this.labels.filter((i) => {
            return (
              i.text.toLowerCase().indexOf(this.label.toLowerCase()) !== -1
            );
          });
    },
  },
  watch: {
    labels: {
      handler(newVal) {
        if (!newVal) {
          return;
        }
        this.userlabels = [...newVal];
      },
      // immediate: true,
      deep: true,
    },
    currentData: {
      handler(newVal) {
        if (!newVal) {
          return;
        }
        this.form = newVal;
        this.addedLabels = newVal.labels || [];
      },
      immediate: true,
      deep: true,
    },
  },
  data: () => ({
    form: {
      title: null,
      content: null,
    },
    label: "",
    userlabels: [],
    addedLabels: [],
    testData,
    sending: false,
    errorMessage: "",
    opensnackbar: false,
  }),
  validations: {
    form: {
      title: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(20),
      },
      content: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(100),
      },
    },
  },
  methods: {
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];

      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty,
        };
      }
    },
    clearForm() {
      this.$v.$reset();
      this.form.content = null;
      this.form.title = null;
    },
    async addLabelsToDb() {
      // check if no labels added then do nothing
      if (this.addedLabels.length === 0) return;

      const { uid } = auth.currentUser;
      const userLabelsFromDb = [...this.labels];

      const cleanedLabel = this.addedLabels.map(({ text }) => ({ text }));

      // check if no labels on  db and just push all to db and exit function
      if (userLabelsFromDb.length === 0) {
        // add all labels to db
        const batch = fireStoreDb.batch();
        let counter = 0;
        cleanedLabel.forEach((doc) => {
          const docRef = fireStoreDb
            .collection("USERS")
            .doc(uid)
            .collection("LABELS")
            .doc(); //automatically generate unique id
          batch.set(docRef, doc);
          counter++;
        });
        if (counter === cleanedLabel.length) {
          await batch.commit();
          return;
        }
      }

      // check if cleanedLabel syncs with users labels from db then do nothing
      const userHasAllLabels = cleanedLabel
        .map((b) => b.text)
        .every((r) => userLabelsFromDb.map((b) => b.text).includes(r));
      if (userHasAllLabels) return;

      // check if cleanedLabel has labels to add to user labels
      const newLabelsFilteredFromAvailableData = cleanedLabel.filter(
        (block) => !userLabelsFromDb.map((b) => b.text).includes(block.text)
      );
      if (newLabelsFilteredFromAvailableData.length > 0) {
        // add all labels to db
        const batch = fireStoreDb.batch();
        let counter = 0;
        newLabelsFilteredFromAvailableData.forEach((doc) => {
          const docRef = fireStoreDb
            .collection("USERS")
            .doc(uid)
            .collection("LABELS")
            .doc(); //automatically generate unique id
          batch.set(docRef, doc);
          counter++;
        });
        if (counter === newLabelsFilteredFromAvailableData.length) {
          await batch.commit();
          return;
        }
      }
    },
    async editUser() {
      this.sending = true;
      const {
        form: { content, title },
        currentData,
      } = this;
      try {
        const { uid } = auth.currentUser;
        this.addLabelsToDb();
        const cleanedLabel = this.addedLabels.map(({ text }) => ({ text }));
        await fireStoreDb
          .collection("USERS")
          .doc(uid)
          .collection("NOTES")
          .doc(currentData?.id)
          .set(
            {
              content,
              title,
              updatetimestamp: firebase.firestore.FieldValue.serverTimestamp(),
              labels: cleanedLabel.length === 0 ? null : cleanedLabel,
            },
            { merge: true }
          );
        this.sending = false;
        this.clearForm();
        this.$emit("close-dialog");
      } catch (error) {
        // Handle Errors here.
        this.sending = false;
        this.opensnackbar = true;
        const { message } = error;
        this.errorMessage = message;
        console.error(error);
      }
    },
    async saveUser() {
      this.sending = true;
      const {
        form: { content, title },
      } = this;
      try {
        this.addLabelsToDb();
        const cleanedLabel = this.addedLabels.map(({ text }) => ({ text }));
        const { uid } = auth.currentUser;
        await fireStoreDb
          .collection("USERS")
          .doc(uid)
          .collection("NOTES")
          .add({
            content,
            title,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            labels: cleanedLabel.length === 0 ? null : cleanedLabel,
          });
        this.sending = false;
        this.clearForm();
        this.$emit("close-dialog");
      } catch (error) {
        // Handle Errors here.
        this.sending = false;
        this.opensnackbar = true;
        const { message } = error;
        this.errorMessage = message;
        console.error(error);
      }
    },
    validateUser() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        if (this.isCreateMode) {
          this.saveUser();
        } else {
          this.editUser();
        }
      }
    },
  },
};
</script>

<style lang="css" scoped>
.md-progress-bar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
}
.md-dialog {
  padding: 24px;
}
.md-dialog-title {
  text-align: center;
  text-transform: uppercase;
}
.padding {
  padding: 24px;
  margin: 12px;
  /* width: 50rem; */
}
.md-card {
  width: 30rem;
  margin: 4px;
  display: block;
  align-self: center;
  margin: 0 auto;
  /* vertical-align: top; */
}
</style>
