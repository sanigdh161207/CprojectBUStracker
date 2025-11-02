// src/Firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyChR2eSROiaynnvPH9lk0re1Im6IDz1K7g",
    authDomain: "aubus-dba10.firebaseapp.com",
    projectId: "aubus-dba10",
    storageBucket: "aubus-dba10.firebasestorage.app",
    messagingSenderId: "515047238119",
    appId: "1:515047238119:web:fea197fbfc4ac177987542",
    measurementId: "G-SEYT1HJ9BR"
};

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const auth = getAuth(app);

export { database, auth };
