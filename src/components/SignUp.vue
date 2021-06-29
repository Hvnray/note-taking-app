<template>
  <md-dialog
    class="padding"
    :md-active.sync="showDialog"
    @md-clicked-outside="closeHandler"
  >
    <md-dialog-title>Sign Up To Note Book App</md-dialog-title>

    <md-card class="padding">
      <md-card-content>
        <form novalidate @submit.prevent="validateUser">
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('firstName')">
                <label for="first-name">First Name</label>
                <md-input
                  name="first-name"
                  id="first-name"
                  autocomplete="given-name"
                  v-model="form.firstName"
                  :disabled="sending"
                />
                <span class="md-error" v-if="!$v.form.firstName.required"
                  >The first name is required</span
                >
                <span class="md-error" v-else-if="!$v.form.firstName.minlength"
                  >Invalid first name</span
                >
              </md-field>
            </div>

            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('lastName')">
                <label for="last-name">Last Name</label>
                <md-input
                  name="last-name"
                  id="last-name"
                  autocomplete="family-name"
                  v-model="form.lastName"
                  :disabled="sending"
                />
                <span class="md-error" v-if="!$v.form.lastName.required"
                  >The last name is required</span
                >
                <span class="md-error" v-else-if="!$v.form.lastName.minlength"
                  >Invalid last name</span
                >
              </md-field>
            </div>

            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('email')">
                <label for="email">Email</label>
                <md-input
                  type="email"
                  name="email"
                  id="email"
                  autocomplete="email"
                  v-model="form.email"
                  :disabled="sending"
                />
                <span class="md-error" v-if="!$v.form.email.required"
                  >Email is required</span
                >
                <span class="md-error" v-else-if="!$v.form.email.email"
                  >Invalid email</span
                >
              </md-field>
            </div>

            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('password')">
                <label for="password">Password</label>
                <md-input
                  type="password"
                  name="password"
                  id="password"
                  autocomplete="password"
                  v-model="form.password"
                  :disabled="sending"
                />
                <span class="md-error" v-if="!$v.form.password.required"
                  >Password is required</span
                >
                <span class="md-error" v-else-if="!$v.form.password.minLength"
                  >Password requires atleast 6 characters</span
                >
                <span class="md-error" v-else-if="!$v.form.password.maxLength"
                  >Password requires atmost 24 characters</span
                >
              </md-field>
            </div>
          </div>
          <md-progress-bar md-mode="indeterminate" v-if="sending" />

          <md-card-actions>
            <md-button class="md-accent" @click="closeHandler">Close</md-button>
            <md-button type="submit" class="md-primary" :disabled="sending"
              >Sign Up</md-button
            >
          </md-card-actions>
        </form>
      </md-card-content>
    </md-card>
    <snack-bar
      :showSnackbar="opensnackbar"
      :message="errorMessage"
      @close="opensnackbar = false"
    />
  </md-dialog>
</template>

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
.padding {
  padding: 24px;
  margin: 12px;
}
.md-card {
  width: 30rem;
  margin: 4px;
  display: block;
  align-self: center;
  margin: 0 auto;
}
</style>
<script>
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength,
} from "vuelidate/lib/validators";
import { auth, db as fireStoreDb, firebase } from "../firebase";
import SnackBar from "@/components/SnackBar";
export default {
  name: "Login",
  components: {
    "snack-bar": SnackBar,
  },
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [validationMixin],
  data: () => ({
    form: {
      password: null,
      email: null,
      lastName: null,
      firstName: null,
    },
    sending: false,
    errorMessage: "",
    opensnackbar: false,
  }),
  validations: {
    form: {
      firstName: {
        required,
        minLength: minLength(3),
      },
      lastName: {
        required,
        minLength: minLength(3),
      },
      password: {
        minLength: minLength(6),
        required,
        maxLength: maxLength(24),
      },
      email: {
        required,
        email,
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
    closeHandler() {
      this.clearForm();
      this.sending = false;
      this.errorMessage = "";
      this.opensnackbar = false;
      this.$emit("close-dialog");
    },
    clearForm() {
      this.$v.$reset();
      this.form.password = null;
      this.form.email = null;
      this.form.firstName = null;
      this.form.lastName = null;
    },
    async saveUser() {
      this.sending = true;
      const {
        form: { firstName, lastName, email, password },
      } = this;
      try {
        const { user } = await auth.createUserWithEmailAndPassword(
          email,
          password
        );
        await fireStoreDb.collection("USERS").doc(user.uid).set({
          firstName,
          lastName,
          email,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        window.setTimeout(() => {
          this.sending = false;
          this.clearForm();
          this.$router.replace({ name: "Note App" });
        }, 500);
      } catch (error) {
        // Handle Errors here.
        this.sending = false;
        this.opensnackbar = true;
        const { code, message } = error;
        this.errorMessage =
          code == "auth/weak-password" ? "The password is too weak." : message;
        console.error(error);
      }
    },
    validateUser() {
      this.$v.$touch();

      if (!this.$v.$invalid) {
        this.saveUser();
      }
    },
  },
};
</script>
