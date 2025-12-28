
// Firebase Configuration for the YFN Social Commerce Node
// Consuming environment variables from the local .env file (Vite VITE_ prefix)

const firebaseConfig = {
  // Use process.env as configured in the project environment to access Firebase variables
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const firebaseInstance = (window as any).firebase;

let app: any = null;
let db: any = null;
let auth: any = null;
let cloudState: 'active' | 'local' | 'connecting' = 'connecting';

/**
 * Initializes Firebase with fail-safe mechanisms.
 * Integrates with Youth Future Network (YFN) cloud services via environment variables.
 */
export const initFirebase = async () => {
  if (!firebaseInstance) {
    console.warn("YFN: Firebase SDK missing from index.html.");
    cloudState = 'local';
    return { app: null, db: null, auth: null, mode: 'local' };
  }

  // Check if env variables are present using process.env instead of import.meta.env
  if (!process.env.VITE_FIREBASE_API_KEY) {
    console.warn("YFN: Missing Firebase Environment Variables. Defaulting to Local Sovereignty.");
    cloudState = 'local';
    return { app: null, db: null, auth: null, mode: 'local' };
  }

  try {
    if (!firebaseInstance.apps.length) {
      app = firebaseInstance.initializeApp(firebaseConfig);
    } else {
      app = firebaseInstance.app();
    }
    
    auth = firebaseInstance.auth();

    // Authentication Protocol
    let authSuccess = false;
    try {
      // Anonymous authentication is used to establish a secure spatial session
      await auth.signInAnonymously();
      authSuccess = true;
      console.log("YFN: Cloud Identity Authenticated via Environment Node.");
    } catch (err: any) {
      console.warn(`YFN Auth Failure: ${err.message}. Ensure Anonymous Auth is enabled in Firebase Console.`);
    }

    // Database Protocol
    if (authSuccess) {
      db = firebaseInstance.firestore();
      
      try {
        await db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
      } catch (e) {}

      try {
        // Verification probe to confirm project access
        await db.collection('_health').limit(1).get();
        cloudState = 'active';
        console.log("YFN: Cloud Node Handshake Successful. Universe Synced.");
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          console.warn("YFN: Cloud Permissions Denied. Check Firestore Rules and API Key restrictions.");
          db = null;
          cloudState = 'local';
        }
      }
    } else {
      cloudState = 'local';
      db = null;
    }

    return { app, db, auth, mode: cloudState };
  } catch (error) {
    console.error("YFN: Critical Backend Failure:", error);
    cloudState = 'local';
    db = null;
    return { app: null, db: null, auth: null, mode: 'local' };
  }
};

export { app, db, auth, cloudState, firebaseInstance as firebase };
