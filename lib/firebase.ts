
// Firebase Configuration for the YFN Social Commerce Node
// Using the compatibility SDK for immediate integration with direct GenAI calls

const firebaseConfig = {
  apiKey: process.env.API_KEY, 
  authDomain: "yfn-creative-universe.firebaseapp.com",
  projectId: "yfn-creative-universe",
  storageBucket: "yfn-creative-universe.appspot.com",
  messagingSenderId: "999999999999",
  appId: "1:999999999999:web:aaaaaaaaaaaaaaaa"
};

const firebaseInstance = (window as any).firebase;

let app: any = null;
let db: any = null;
let auth: any = null;
let cloudState: 'active' | 'local' | 'connecting' = 'connecting';

/**
 * Initializes Firebase with fail-safe mechanisms.
 * If authentication fails, it proactively disables Firestore to prevent permission-denied logs.
 */
export const initFirebase = async () => {
  if (!firebaseInstance) {
    console.warn("YFN: Firebase SDK missing.");
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
    // We don't initialize 'db' globally yet to prevent premature connection attempts

    // 1. Authentication Protocol
    let authSuccess = false;
    try {
      await auth.signInAnonymously();
      authSuccess = true;
      console.log("YFN: Cloud Identity Authenticated.");
    } catch (err: any) {
      console.warn(`YFN Auth Failure: ${err.message}. Defaulting to Local Sovereign Mode.`);
    }

    // 2. Conditional Cloud Initialization
    if (authSuccess) {
      db = firebaseInstance.firestore();
      
      // Attempt persistence silently
      try {
        await db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
      } catch (e) {}

      // 3. Permission Health Check
      try {
        // We use a very light probe. 
        // If this fails, we nullify db to prevent the rest of the app from triggering logs.
        await db.collection('_health').limit(1).get();
        cloudState = 'active';
        console.log("YFN: Cloud Node Handshake Successful.");
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          console.warn("YFN: Cloud Permissions Denied. Firestore Node Deactivated.");
          db = null; // Kill the db reference to prevent further attempts
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

// Global Cloud Mode Export
export { app, db, auth, cloudState, firebaseInstance as firebase };
