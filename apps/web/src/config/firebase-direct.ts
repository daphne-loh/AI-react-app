import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Direct Firebase configuration - for debugging
// TODO: Move back to environment variables once Vite config is fixed
const firebaseConfig = {
  apiKey: "AIzaSyDOu9Urzc9Kq5LnKNzegIqIvDfZuo75Gq4",
  authDomain: "fooddrop-2d5ca.firebaseapp.com",
  projectId: "fooddrop-2d5ca",
  storageBucket: "fooddrop-2d5ca.appspot.com",
  messagingSenderId: "945202476748",
  appId: "1:945202476748:web:c41b632d374924620f3469"
};

console.log('🔥 Using direct Firebase config for debugging');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;