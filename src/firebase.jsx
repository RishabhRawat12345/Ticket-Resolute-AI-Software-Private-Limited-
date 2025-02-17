
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgwn6RC01CqU3rx9IqkxFzPDnAwHezcis",
  authDomain: "ticket-project-e7819.firebaseapp.com",
  projectId: "ticket-project-e7819",
  messagingSenderId: "417701059158",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);