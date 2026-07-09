import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfig from '@/firebase-applet-config.json';

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let isFirebaseConfigured = false;

if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== '') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    
    auth = getAuth(app);
    
    // As per skill instructions: The app will break without specifying firestoreDatabaseId if configured
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    
    try {
      storage = getStorage(app);
    } catch (err) {
      console.warn("Firebase Storage failed to initialize:", err);
    }
    
    isFirebaseConfigured = true;
    console.log("Firebase initialized successfully with configuration.");
    
    // Validate connection to Firestore asynchronously
    getDocFromServer(doc(db, 'test', 'connection')).catch((error) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Firestore connection offline. Please check your Firebase configuration.");
      }
    });
  } catch (error) {
    console.error("Firebase failed to initialize:", error);
    isFirebaseConfigured = false;
  }
} else {
  console.log("Firebase is not configured. Running in Local Database Mode.");
}

export { auth, db, storage, isFirebaseConfigured };

// Standardized Firestore error handling as per skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  
  // Only extract auth properties if auth is initialized and current user exists
  const currentUser = auth?.currentUser;
  
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
    },
    operationType,
    path
  };
  
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
