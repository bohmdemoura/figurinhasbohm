import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBr_SMIbAWHT5ZlycKVd26v0q2rjttSRGQ",
    authDomain: "figurinhasbohm.firebaseapp.com",
    projectId: "figurinhasbohm",
    storageBucket: "figurinhasbohm.firebasestorage.app",
    messagingSenderId: "1074630590696",
    appId: "1:1074630590696:web:a9e8919c6acd95feeb495d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);