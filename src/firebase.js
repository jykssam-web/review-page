import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBL-aN5qf0SJzFgxvuQwjKxGuE5KgXPuKI",
  projectId: "gen-lang-client-0617105081",
  appId: "1:84076770878:web:b1b279a176354212b0036f",
  firestoreDatabaseId: "ai-studio-c53ee265-a8a1-4a98-880f-1e4b74c320ef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
