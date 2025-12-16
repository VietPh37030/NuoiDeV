import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
    apiKey: "AIzaSyCqk0E4AdqgLs9M9yhNrbgfWRuGYon6tYQ",
    authDomain: "nuoidev.firebaseapp.com",
    projectId: "nuoidev",
    storageBucket: "nuoidev.firebasestorage.app",
    messagingSenderId: "875376556220",
    appId: "1:875376556220:web:b5190a44bb4bc76971f8b9",
    measurementId: "G-QB8HSB0FCC"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// Analytics (only in browser)
let analytics = null
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app)
}
export { analytics }
