
import { initializeApp, FirebaseApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, Firestore, writeBatch, query, limit, getDocs } from 'firebase/firestore';
import { Report, User, FirebaseConfig } from '../types';
import { MOCK_REPORTS, MOCK_USERS } from '../constants';

const LS_REPORTS_KEY = 'atm_reports_data';
const LS_USERS_KEY = 'atm_users_data';
const LS_CONFIG_KEY = 'atm_firebase_config';

class DatabaseService {
    private db: Firestore | null = null;
    private app: FirebaseApp | null = null;
    private useFirebase: boolean = false;
    private listeners: Function[] = [];

    constructor() {
        this.initialize();
    }

    private initialize() {
        const configStr = localStorage.getItem(LS_CONFIG_KEY);
        if (configStr) {
            try {
                const config = JSON.parse(configStr);
                if (getApps().length === 0) {
                    this.app = initializeApp(config);
                } else {
                    this.app = getApps()[0]; // Use existing app if already initialized
                }
                this.db = getFirestore(this.app);
                this.useFirebase = true;
                console.log("Firebase initialized successfully");
            } catch (e) {
                console.error("Failed to initialize Firebase", e);
                this.useFirebase = false;
            }
        } else {
            this.useFirebase = false;
            this.seedLocalData();
        }
    }

    private seedLocalData() {
        if (!localStorage.getItem(LS_REPORTS_KEY)) {
            localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(MOCK_REPORTS));
        }
        if (!localStorage.getItem(LS_USERS_KEY)) {
            localStorage.setItem(LS_USERS_KEY, JSON.stringify(MOCK_USERS));
        }
    }

    public isFirebaseConnected(): boolean {
        return this.useFirebase;
    }

    public async saveConfig(config: FirebaseConfig) {
        localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(config));
        
        // Force re-initialization
        // Note: Firebase Web SDK doesn't easily support re-init with different config in same session without reload or deleteApp
        // We will try to delete existing app first
        if (this.app) {
           try {
               await deleteApp(this.app);
           } catch(e) { console.warn("Error deleting app", e); }
        }
        
        this.initialize();
        window.location.reload(); // Reload to ensure clean connection
    }

    public clearConfig() {
        localStorage.removeItem(LS_CONFIG_KEY);
        this.useFirebase = false;
        window.location.reload();
    }

    public async testConnection() {
        if (!this.useFirebase || !this.db) {
            throw new Error("التطبيق غير متصل بـ Firebase حالياً.");
        }
        try {
            // Attempt to fetch 1 document from reports to verify read access and network connectivity
            const q = query(collection(this.db, 'reports'), limit(1));
            await getDocs(q);
            return true;
        } catch (error: any) {
            console.error("Test connection failed", error);
            throw new Error(error.message || "فشل الاتصال بقاعدة البيانات.");
        }
    }

    // --- REPORTS ---

    public subscribeToReports(callback: (reports: Report[]) => void): () => void {
        if (this.useFirebase && this.db) {
            const unsub = onSnapshot(collection(this.db, 'reports'), (snapshot) => {
                const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
                // Sort by date desc by default for the raw feed
                reports.sort((a, b) => new Date(b.maintenance_date).getTime() - new Date(a.maintenance_date).getTime());
                callback(reports);
            }, (error) => {
                console.error("Firebase reports listener error", error);
                // Fallback to local if permission denied or error
                callback(this.getLocalReports());
            });
            return unsub;
        } else {
            // Local Storage subscription (simulated with interval or custom event)
            const handler = () => {
                callback(this.getLocalReports());
            };
            window.addEventListener('storage', handler);
            // Initial call
            callback(this.getLocalReports());
            
            // Allow internal triggers
            const internalId = setInterval(() => {
                // Polling purely for simpler reactivity if not using custom events everywhere
                 const current = localStorage.getItem(LS_REPORTS_KEY);
                 // We rely on the app state mainly, but this safety net helps tabs sync
            }, 1000);

            return () => {
                window.removeEventListener('storage', handler);
                clearInterval(internalId);
            };
        }
    }

    private getLocalReports(): Report[] {
        const data = localStorage.getItem(LS_REPORTS_KEY);
        return data ? JSON.parse(data) : [];
    }

    public async addReport(report: Omit<Report, 'id'> | Report) {
        if (this.useFirebase && this.db) {
            // Remove ID if present to let Firestore gen it, or use setDoc if we want specific ID
            const { id, ...data } = report as any;
            if (id && !String(id).startsWith('report-')) { 
                // If it looks like a real ID, use setDoc
                await setDoc(doc(this.db, 'reports', id), data);
            } else {
                await addDoc(collection(this.db, 'reports'), data);
            }
        } else {
            const reports = this.getLocalReports();
            const newReport = { ...report, id: `report-${Date.now()}` } as Report;
            reports.unshift(newReport);
            localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(reports));
            this.notifyLocalChange();
        }
    }

    public async updateReport(report: Report) {
        if (this.useFirebase && this.db) {
            const { id, ...data } = report;
            await setDoc(doc(this.db, 'reports', id), data, { merge: true });
        } else {
            const reports = this.getLocalReports();
            const index = reports.findIndex(r => r.id === report.id);
            if (index !== -1) {
                reports[index] = report;
                localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(reports));
                this.notifyLocalChange();
            }
        }
    }

    public async deleteReports(ids: string[]) {
        if (this.useFirebase && this.db) {
            const batch = writeBatch(this.db);
            ids.forEach(id => {
                if (this.db) { // Check for TS
                    const ref = doc(this.db, 'reports', id);
                    batch.delete(ref);
                }
            });
            await batch.commit();
        } else {
            let reports = this.getLocalReports();
            reports = reports.filter(r => !ids.includes(r.id));
            localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(reports));
            this.notifyLocalChange();
        }
    }

    // --- USERS ---

    public subscribeToUsers(callback: (users: User[]) => void): () => void {
        if (this.useFirebase && this.db) {
            return onSnapshot(collection(this.db, 'users'), (snapshot) => {
                const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                callback(users);
            });
        } else {
            const handler = () => callback(this.getLocalUsers());
            window.addEventListener('storage', handler);
            callback(this.getLocalUsers());
            return () => window.removeEventListener('storage', handler);
        }
    }

    private getLocalUsers(): User[] {
        const data = localStorage.getItem(LS_USERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    public async addUser(user: Omit<User, 'id'>) {
        if (this.useFirebase && this.db) {
            await addDoc(collection(this.db, 'users'), user);
        } else {
            const users = this.getLocalUsers();
            const newUser = { ...user, id: `user-${Date.now()}` };
            users.push(newUser);
            localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
            this.notifyLocalChange();
        }
    }

    public async updateUser(user: User) {
        if (this.useFirebase && this.db) {
            const { id, ...data } = user;
            await setDoc(doc(this.db, 'users', id), data, { merge: true });
        } else {
            const users = this.getLocalUsers();
            const index = users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                users[index] = user;
                localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
                this.notifyLocalChange();
            }
        }
    }

    public async deleteUser(id: string) {
        if (this.useFirebase && this.db) {
            await deleteDoc(doc(this.db, 'users', id));
        } else {
            let users = this.getLocalUsers();
            users = users.filter(u => u.id !== id);
            localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
            this.notifyLocalChange();
        }
    }

    /**
     * Uploads all local data (Users and Reports) to Firestore.
     * Uses batch writes for atomicity (per chunk) and merges data to prevent overwrites of non-conflicting fields if any.
     */
    public async syncLocalDataToFirebase() {
        if (!this.useFirebase || !this.db) {
            throw new Error("لا يوجد اتصال بقاعدة البيانات السحابية.");
        }

        const localReports = this.getLocalReports();
        const localUsers = this.getLocalUsers();

        const totalItems = localReports.length + localUsers.length;
        if (totalItems === 0) return { reports: 0, users: 0 };

        // Firestore batch limit is 500 operations. We'll use 450 to be safe.
        const BATCH_SIZE = 450;
        
        // Combine all operations
        const allOps = [
            ...localReports.map(r => ({ type: 'report', item: r })),
            ...localUsers.map(u => ({ type: 'user', item: u }))
        ];

        let batch = writeBatch(this.db);
        let count = 0;
        let totalCommitted = 0;

        for (let i = 0; i < allOps.length; i++) {
            const op = allOps[i];
            
            if (op.type === 'report') {
                const report = op.item as Report;
                const { id, ...data } = report;
                // Use the existing ID from local storage as the doc ID in Firestore
                const ref = doc(this.db, 'reports', id);
                batch.set(ref, data, { merge: true });
            } else {
                const user = op.item as User;
                const { id, ...data } = user;
                const ref = doc(this.db, 'users', id);
                batch.set(ref, data, { merge: true });
            }

            count++;

            // If batch is full or this is the last item, commit
            if (count >= BATCH_SIZE || i === allOps.length - 1) {
                await batch.commit();
                totalCommitted += count;
                count = 0;
                if (i < allOps.length - 1) {
                    batch = writeBatch(this.db);
                }
            }
        }

        return { reports: localReports.length, users: localUsers.length };
    }

    // Helper to trigger updates across the app when using local storage
    private notifyLocalChange() {
        window.dispatchEvent(new Event('storage'));
        // Also dispatch a custom event for the current window since 'storage' only fires on OTHER windows
        window.dispatchEvent(new Event('local-db-change'));
    }

    public onLocalChange(callback: () => void) {
        window.addEventListener('local-db-change', callback);
        return () => window.removeEventListener('local-db-change', callback);
    }
}

export const db = new DatabaseService();
