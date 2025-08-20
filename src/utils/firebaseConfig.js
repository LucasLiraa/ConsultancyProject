import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDd1eX6vB5Qudxorougp637s3gnSW6QobA",
  authDomain: "consultoryproject.firebaseapp.com",
  projectId: "consultoryproject",
  storageBucket: "consultoryproject.firebasestorage.app",
  messagingSenderId: "898768106338",
  appId: "1:898768106338:web:86564e1dabc6d73679f23b",
  measurementId: "G-35T3ZLR05K"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = getFirestore(app);

export { db };