import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD5Ua_UiupL_QPE3RdMvOZqMqpABige6QM",
  authDomain: "ima-studio-platefom.firebaseapp.com",
  projectId: "ima-studio-platefom",
  storageBucket: "ima-studio-platefom.firebasestorage.app",
  messagingSenderId: "82739709684",
  appId: "1:82739709684:web:0577d69b5adfb8bbba80a1",
  measurementId: "G-MPNK2FY8JS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
