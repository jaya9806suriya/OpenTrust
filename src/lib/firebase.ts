import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { AnalysisSession } from '../types';

if (!firebaseConfigData?.apiKey || !firebaseConfigData?.projectId) {
  throw new Error(
    'Firebase configuration error: Missing apiKey or projectId in firebase-applet-config.json'
  );
}

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
const databaseId = firebaseConfigData.firestoreDatabaseId;
export const db: Firestore = databaseId && databaseId !== '(default)' 
  ? getFirestore(app, databaseId) 
  : getFirestore(app);

// Auth helper functions
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    throw error;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Firestore helper functions for Analysis Sessions / Scans
export const saveScanToFirestore = async (session: AnalysisSession, userId?: string) => {
  try {
    const scanRef = doc(db, 'scans', session.id);
    await setDoc(scanRef, {
      ...session,
      savedBy: userId || 'anonymous',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
    console.log(`Scan ${session.id} persisted to Firestore successfully.`);
  } catch (error) {
    console.error('Error saving scan to Firestore:', error);
  }
};

export const updateQuarantineInFirestore = async (scanId: string, quarantined: boolean) => {
  try {
    const scanRef = doc(db, 'scans', scanId);
    await updateDoc(scanRef, {
      isQuarantined: quarantined,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating quarantine status in Firestore:', error);
  }
};

export const subscribeToScans = (onUpdate: (scans: AnalysisSession[]) => void) => {
  try {
    const scansCol = collection(db, 'scans');
    return onSnapshot(scansCol, (snapshot) => {
      const scans: AnalysisSession[] = [];
      snapshot.forEach((docSnap) => {
        scans.push(docSnap.data() as AnalysisSession);
      });
      if (scans.length > 0) {
        onUpdate(scans);
      }
    }, (err) => {
      console.warn('Firestore subscription notice (using local state fallback):', err.message);
    });
  } catch (e) {
    console.warn('Could not establish Firestore subscription:', e);
    return () => {};
  }
};
