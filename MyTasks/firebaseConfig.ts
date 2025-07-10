import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoNdxTpB525T7XZD2jX8BEn2xixIn0hXA",
  authDomain: "mytasks-b3641.firebaseapp.com",
  databaseURL: "https://mytasks-b3641-default-rtdb.firebaseio.com",
  projectId: "mytasks-b3641",
  storageBucket: "mytasks-b3641.firebasestorage.app",
  messagingSenderId: "161398281763",
  appId: "1:161398281763:web:924f2003671ed026c34396",
  measurementId: "G-G63LDCZ44N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth for Expo
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
