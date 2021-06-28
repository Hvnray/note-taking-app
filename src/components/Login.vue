<template>
  <div>
    <md-card md-with-hover class="padding">
      <!-- <md-ripple> -->
      <md-card-header>
        <div class="md-subhead">Login to Start taking Notes</div>
        <!-- <div class="md-subhead">It also have a ripple</div> -->
      </md-card-header>

      <md-card-content>
        <form novalidate @submit.prevent="validateUser">
          <div class="md-layout md-gutter">
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
            <md-button
              type="submit"
              class="md-raised md-primary"
              :disabled="sending"
              >Login</md-button
            >
          </md-card-actions>

          <div class="bottom-section">
            <p class="md-body-1">Don't have an Account?</p>
            <md-button class="md-primary" @click="openDialog = true"
              >Sign Up</md-button
            >
          </div>
        </form>
      </md-card-content>
    </md-card>
    <sign-up :showDialog="openDialog" @close-dialog="openDialog = false" />
    <snack-bar
      :showSnackbar="opensnackbar"
      :message="errorMessage"
      @close="opensnackbar = false"
    />
  </div>
</template>

<script>
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength,
} from "vuelidate/lib/validators";
import SignUp from "@/components/SignUp";
import SnackBar from "@/components/SnackBar";
import { auth } from "../firebase";
export default {
  name: "Login",
  components: {
    "sign-up": SignUp,
    "snack-bar": SnackBar,
  },
  mixins: [validationMixin],
  data: () => ({
    form: {
      password: null,
      email: null,
    },
    sending: false,
    errorMessage: "",
    opensnackbar: false,
    openDialog: false,
  }),
  validations: {
    form: {
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
    clearForm() {
      this.$v.$reset();
      this.form.password = null;
      this.form.email = null;
    },
    async loginUser() {
      this.sending = true;
      const {
        form: { email, password },
      } = this;
      try {
        const { user } = await auth.signInWithEmailAndPassword(email, password);
        console.log("data", { email, password }, "resp", user);
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
        this.loginUser();
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
.bottom-section {
  display: flex;
  margin-top: 20px;
  justify-content: center;
}
.padding {
  padding: 24px;
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
