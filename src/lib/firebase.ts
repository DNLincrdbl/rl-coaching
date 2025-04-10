import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDpz1Dg2Kw57UlngovZp5s0k6EtXDwTTEc",
  authDomain: "rl-coaching-96348.firebaseapp.com",
  projectId: "rl-coaching-96348",
  storageBucket: "rl-coaching-96348.firebasestorage.app",
  messagingSenderId: "422532831522",
  appId: "1:422532831522:web:193e14397a8e3db152ed7b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 