// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0h7az_4UW0TYbGoJsSP7wk6s1eV2ls8o",
  authDomain: "edupoint-1069d.firebaseapp.com",
  projectId: "edupoint-1069d",
  storageBucket: "edupoint-1069d.firebasestorage.app",
  messagingSenderId: "1057493954076",
  appId: "1:1057493954076:web:c3d3a3f2cd492a412b79d9",
  measurementId: "G-188BVHTBH8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;