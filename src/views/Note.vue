<template>
  <div class="page-container">
    <md-app md-waterfall md-mode="fixed">
      <!-- navbar section  -->
      <md-app-toolbar class="md-primary" md-elevation="1">
        <Navbar @signOut="signOut" :email="userEmail" v-model="search" />
      </md-app-toolbar>
      <!-- drawer  -->
      <md-app-drawer md-permanent="clipped" class="md-scrollbar">
        <Drawer :labels="userLabelList" @label-selected="filterByLabel" />
      </md-app-drawer>
      <md-app-content>
        <!-- <Note /> -->

        <div
          class="md-layout md-alignment-top-start"
          v-if="filteredNotes.length > 0"
        >
          <div
            v-for="item in filteredNotes"
            :key="item.id"
            class="
              md-layout-item md-size-33 md-small-size-50 md-xsmall-size-100
              padded
            "
          >
            <NoteCard
              :currentNote="item"
              @edit-card-click="handleEdit"
              @delete-card-click="handleDelete"
            />
          </div>
        </div>
        <md-empty-state
          v-if="filteredNotes.length === 0"
          :md-icon="mdIcon"
          :md-label="mdText"
          md-description="Start creating notes by clicking the floating action button"
        >
        </md-empty-state>
        <md-button
          class="md-fab md-primary md-fab-bottom-right"
          @click="addNote"
        >
          <md-icon>add</md-icon>
        </md-button>
        <NoteForm
          :key="`note-${noteCounter}`"
          :showDialog="showForm"
          :labels="userLabelList"
          :isCreateMode="isCreateMode"
          :currentData="currentData"
          @close-dialog="closeForm"
        />
        <md-dialog-confirm
          :key="`dialog-${noteCounter}`"
          :md-active.sync="openDeleteConfirmHandler"
          :md-title="`Confirm Delete: ${currentData.title} ?`"
          md-content="Are you sure you want to delete this note? <br> This action is <strong>permanent</strong> confirm to continue."
          md-confirm-text="Agree"
          md-cancel-text="Disagree"
          @md-cancel="onDeleteCancel"
          @md-confirm="onDeleteConfirm"
        />
        <Snackbar
          :showSnackbar="opensnackbar"
          :message="errorMessage"
          @close="opensnackbar = false"
        />
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
// @ is an alias to /src
import Navbar from "@/layout/Navbar.vue";
import Drawer from "@/layout/Drawer.vue";
import NoteCard from "@/components/Note/NoteCard";
import NoteForm from "@/components/Note/NoteForm";
import Snackbar from "@/components/SnackBar";
import { auth, db } from "../firebase";

export default {
  name: "Note",
  components: {
    Navbar,
    Drawer,
    NoteCard,
    NoteForm,
    Snackbar,
  },
  watch: {
    // Handles internal model changes.
    search: {
      handler(newVal) {
        if (newVal !== "") {
          this.labelClickFilter = "";
        }
      },
      immediate: true,
    },
    labelClickFilter: {
      handler(newVal) {
        if (newVal !== "") {
          this.search = "";
        }
      },
      immediate: true,
    },
  },
  computed: {
    mdIcon() {
      return this.isLoadingData ? "loop" : "note_add";
    },
    userId() {
      return auth.currentUser?.uid;
    },
    mdText() {
      return this.isLoadingData ? "Loading Data" : "No Notes Available";
    },
    filteredNotes() {
      if (this.labelClickFilter !== "") {
        return this.computeNoteByLabelClick();
      }
      // FILTER NOTES BY SEARCH TERN
      if (this.search !== "") {
        return this.computeNoteBySearch();
      }
      return this.userNotesList;
    },
  },
  data() {
    return {
      opensnackbar: false,
      isLoadingData: true,
      search: "",
      errorMessage: "",
      userEmail: "",
      noteCounter: 0,
      showForm: false,
      isCreateMode: true,
      currentData: {},
      hasNotes: false,
      userNotesList: [],
      userLabelList: [],
      // userLabelsUnique: [],
      openDeleteConfirmHandler: false,
      labelClickFilter: "",
    };
  },
  created() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        //get user notes
        const docRef = db.collection("USERS").doc(user.uid);
        this.getUserData(docRef);
        this.getAllNotesFromDb(docRef);
        //get user labels
        this.getUserLabelsFromDb(docRef);
      }
    });
  },
  methods: {
    computeNoteByLabelClick() {
      if (this.labelClickFilter === "ALL") return this.userNotesList;
      return this.userNotesList.filter((v) => {
        return v.labels.some((v) =>
          v.text?.toLowerCase().includes(this.labelClickFilter?.toLowerCase())
        );
      });
    },
    computeNoteBySearch() {
      return this.userNotesList.filter((v) => {
        return (
          v.title.toLowerCase().includes(this.search.toLowerCase()) ||
          v.content.toLowerCase().includes(this.search.toLowerCase()) ||
          v.labels.some((v) =>
            v.text?.toLowerCase().includes(this.search?.toLowerCase())
          )
        );
      });
    },
    getUserData(docRef) {
      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            this.userEmail = `${doc.data().firstName} ${doc.data().lastName}`;
          }
        })
        .catch((error) => {
          this.opensnackbar = true;
          this.errorMessage =
            typeof error === "string" ? error : error?.message;
          this.isLoadingData = false;
        });
    },
    getUserLabelsFromDb(docRef) {
      try {
        docRef
          .collection("LABELS")
          // .orderBy("timestamp", "desc")
          .onSnapshot(
            (snapshot) => {
              const arr = [];
              snapshot.forEach((doc) => {
                const obj = { id: doc.id, ...doc.data() };
                arr.push(obj);
              });
              this.userLabelList = arr;
            },
            (error) => {
              this.opensnackbar = true;
              this.errorMessage =
                typeof error === "string" ? error : error?.message;
              this.isLoadingData = false;
            }
          );
      } catch (error) {
        this.opensnackbar = true;
        this.errorMessage = typeof error === "string" ? error : error?.message;
        this.isLoadingData = false;
      }
    },
    getAllNotesFromDb(docRef) {
      try {
        docRef
          .collection("NOTES")
          .orderBy("timestamp", "desc")
          .onSnapshot(
            (snapshot) => {
              const arr = [];
              // let allLabels = [];
              snapshot.forEach((doc) => {
                const obj = { id: doc.id, ...doc.data() };
                arr.push(obj);
              });
              this.userNotesList = arr;
              this.isLoadingData = false;
            },
            (error) => {
              this.opensnackbar = true;
              this.errorMessage =
                typeof error === "string" ? error : error?.message;
              this.isLoadingData = false;
            }
          );
      } catch (error) {
        this.opensnackbar = true;
        this.errorMessage = typeof error === "string" ? error : error?.message;
        this.isLoadingData = false;
      }
    },
    filterByLabel(label) {
      this.labelClickFilter = label.text;
    },
    handleEdit(data) {
      this.isCreateMode = false;
      this.noteCounter++;
      this.currentData = { ...data };
      this.showForm = true;
    },
    onDeleteCancel() {
      this.openDeleteConfirmHandler = false;
      this.currentData = {};
      this.noteCounter++;
    },
    handleDeleteOfLabels() {
      // do nothing if no labels on note
      if (this.currentData?.labels?.length === 0) {
        return;
      }
      const getLabelIds = this.currentData?.labels.map((b) =>
        this.userLabelList.find((data) => data.text === b.text)
      );
      const currentData = { ...this.currentData, labels: getLabelIds };

      // check if label is present in other notes except calling note
      let allLabels = [];
      let counter = 0;
      this.userNotesList?.forEach((b) => {
        if (b.id !== currentData.id) {
          const { labels } = b;
          allLabels = [...allLabels, ...(labels.map((b) => b.text) || [])];
        }
        counter++;
      });

      // after gathering, remove labels to delete
      //by checking currentData labels not in all data labels
      if (counter === this.userNotesList.length) {
        const labelsToDelete = currentData.labels.filter(
          ({ text }) => !allLabels.includes(text)
        );

        // BATCH DELETE LABELS
        const batch = db.batch();
        let counter2 = 0;
        labelsToDelete.forEach((doc) => {
          const docRef = db
            .collection("USERS")
            .doc(this.userId)
            .collection("LABELS")
            .doc(doc.id); //automatically generate unique id
          batch.delete(docRef);
          counter2++;
        });
        if (counter2 === labelsToDelete.length) {
          return batch.commit();
        }
      }
    },
    async onDeleteConfirm() {
      await this.handleDeleteOfLabels();
      db.collection("USERS")
        .doc(this.userId)
        .collection("NOTES")
        .doc(this.currentData?.id)
        .delete()
        .then(() => {
          this.openDeleteConfirmHandler = false;
          this.currentData = {};
          this.noteCounter++;
        })
        .catch((error) => {
          this.opensnackbar = true;
          this.errorMessage =
            typeof error === "string" ? error : error?.message;
          console.error("Error removing document: ", error);
        });
    },
    handleDelete(data) {
      this.noteCounter++;
      this.openDeleteConfirmHandler = true;
      this.currentData = { ...data };
    },
    addNote() {
      this.isCreateMode = true;
      this.noteCounter++;
      this.currentData = {};
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
    },
    async signOut() {
      try {
        await auth.signOut();
        this.$router.replace({ name: "Home" });
      } catch (error) {
        this.opensnackbar = true;
        this.errorMessage = typeof error === "string" ? error : error?.message;
        console.error("Error removing document: ", error);
      }
    },
  },
};
</script>

<style lang="css" scoped>
.md-app {
  height: 100vh;
  border: 1px solid black;
}
.t-start {
  text-align: start;
}
.padded {
  padding: 20px;
}
/* .md-app-content {
  display: flex;
} */
/* Demo purposes only */
.md-drawer {
  width: 230px;
  max-height: calc(100vh - 40px);
  max-width: calc(100vw - 125px);
}
</style>
