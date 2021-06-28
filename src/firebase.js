// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2gz5ahwuLHTcNfDZ7bpzgxmFbXH787R0",
  authDomain: "note-taking-app-354b3.firebaseapp.com",
  projectId: "note-taking-app-354b3",
  storageBucket: "note-taking-app-354b3.appspot.com",
  messagingSenderId: "567785050430",
  appId: "1:567785050430:web:97e86087702f7463535c6f",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

export { firebase, auth, db };
export default firebase;
