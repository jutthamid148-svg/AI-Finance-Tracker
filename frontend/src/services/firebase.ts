import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Only initialize Firebase if API key is configured (skips crash on local dev without .env)
const hasFirebaseConfig = !!firebaseConfig.apiKey

let auth: ReturnType<typeof getAuth> | null = null
let googleProvider: GoogleAuthProvider | null = null

if (hasFirebaseConfig) {
  const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })
}

export { auth, googleProvider, hasFirebaseConfig }

export async function googleSignIn() {
  if (!auth || !googleProvider) throw new Error('Google Sign-In is not configured. Please set VITE_FIREBASE_* env variables.')
  const result  = await signInWithPopup(auth, googleProvider)
  const idToken = await result.user.getIdToken()
  return {
    idToken,
    email:       result.user.email ?? '',
    displayName: result.user.displayName ?? '',
    photoURL:    result.user.photoURL ?? '',
  }
}

export async function firebaseSignOut() {
  if (auth) await signOut(auth)
}
