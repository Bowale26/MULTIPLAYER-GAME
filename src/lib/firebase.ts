import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot, 
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection verification test as per Firebase integration instructions
export async function verifyFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection to Firestore verified.');
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or Firestore config issue:', error);
      return false;
    }
    // Any other error (e.g., missing doc) still confirms live network handshake
    return true;
  }
}

// Event Sourcing: Commit Immutable Match Record
export interface MatchHistoryRecord {
  matchId: string;
  roomCode: string;
  winnerUid: string;
  winnerNickname: string;
  loserUid?: string;
  participants: Array<{
    id: string;
    nickname: string;
    score: number;
    streak: number;
    isBot?: boolean;
  }>;
  finalScores: Record<string, number>;
  timestamp: number;
  streakDelta: number;
  roundsPlayed: number;
  gameMode: string;
  concurrencyToken?: string;
}

export async function commitMatchHistoryToFirestore(event: MatchHistoryRecord) {
  try {
    const matchRef = doc(db, 'match_history', event.matchId);
    // Use transaction to ensure idempotency and prevent double-dipping / racing
    await runTransaction(db, async (transaction) => {
      const existing = await transaction.get(matchRef);
      if (existing.exists()) {
        console.log(`[Firestore Event Sourcing] Match ${event.matchId} already committed.`);
        return;
      }
      transaction.set(matchRef, {
        ...event,
        serverTime: serverTimestamp(),
      });
    });
    console.log(`[Firestore Event Sourcing] Successfully committed match ${event.matchId}`);
    return true;
  } catch (err) {
    console.warn('[Firestore Event Sourcing] Commit error (fallback active):', err);
    return false;
  }
}

// Fetch permanent historical match records for player or global
export async function fetchHistoricalMatches(limitCount = 20): Promise<MatchHistoryRecord[]> {
  try {
    const q = query(
      collection(db, 'match_history'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const results: MatchHistoryRecord[] = [];
    snap.forEach((d) => {
      results.push(d.data() as MatchHistoryRecord);
    });
    return results;
  } catch (err) {
    console.warn('[Firestore] Error fetching match history:', err);
    return [];
  }
}

// Realtime match listener for a room
export function subscribeToMatchSession(roomCode: string, onUpdate: (data: any) => void) {
  const roomRef = doc(db, 'rooms', roomCode);
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data());
    }
  }, (err) => {
    console.warn(`[Firestore onSnapshot] Room ${roomCode} subscription error:`, err);
  });
}
