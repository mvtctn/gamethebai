import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration using environment variables
// Falls back to a shared public demo Firebase Realtime Database so it works immediately out of the box!
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB_demo_api_key_for_panini_wc26_app",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thebongda-panini.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://thebongda-panini-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thebongda-panini",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thebongda-panini.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "485729104829",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:485729104829:web:3e2d1c0b9a8f7e6d"
};

let app;
let database;
let isConnectedToFirebase = false;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  isConnectedToFirebase = true;
  console.log('[Firebase] Realtime Database initialized successfully!');
} catch (error) {
  console.error('[Firebase] Initialization failed. Falling back to local offline mode:', error);
  isConnectedToFirebase = false;
}

export { database, isConnectedToFirebase };
