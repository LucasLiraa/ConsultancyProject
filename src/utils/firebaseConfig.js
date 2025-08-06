// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDd1eX6vB5Qudxorougp637s3gnSW6QobA",
  authDomain: "consultoryproject.firebaseapp.com",
  projectId: "consultoryproject",
  storageBucket: "consultoryproject.firebasestorage.app",
  messagingSenderId: "898768106338",
  appId: "1:898768106338:web:86564e1dabc6d73679f23b",
  measurementId: "G-35T3ZLR05K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };