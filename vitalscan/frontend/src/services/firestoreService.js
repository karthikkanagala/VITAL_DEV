import {
  doc, getDoc, setDoc, addDoc,
  collection, query, where,
  getDocs, orderBy, updateDoc,
  serverTimestamp, writeBatch, deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  encryptProfile, decryptProfile,
  encryptAssessment, decryptAssessment,
  encryptContacts, decryptContacts,
} from './encryption';

// ── USER PROFILE ─────────────────────────────────

export async function createUserProfile(userId, userData) {
  try {
    const encrypted = encryptProfile({
      ...userData,
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'users', userId), encrypted);
  } catch { return null; }
}

export async function getUserProfile(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return decryptProfile(snap.data());
  } catch { return null; }
}

export async function updateUserProfile(userId, updates) {
  try {
    const current = await getUserProfile(userId);
    const merged = { ...(current || {}), ...updates };
    const encrypted = encryptProfile(merged);
    await updateDoc(doc(db, 'users', userId), encrypted);
  } catch { return null; }
}

// ── ASSESSMENTS ─────────────────────────────────

export async function saveAssessment(userId, data) {
  try {
    const encrypted = encryptAssessment({
      userId,
      heartRisk: data.heartRisk,
      diabetesRisk: data.diabetesRisk,
      obesityRisk: data.obesityRisk,
      inputs: data.inputs || {},
      createdAt: serverTimestamp(),
    });
    const ref = await addDoc(collection(db, 'assessments'), encrypted);
    return ref.id;
  } catch { return null; }
}

export async function getUserAssessments(userId) {
  try {
    const q = query(
      collection(db, 'assessments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...decryptAssessment(d.data()),
    }));
  } catch { return []; }
}

export async function deleteAllAssessments(userId) {
  try {
    const q = query(collection(db, 'assessments'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch { return null; }
}

// ── EMERGENCY CONTACTS ────────────────────────────

export async function saveEmergencyContacts(userId, contacts) {
  try {
    const encrypted = encryptContacts(contacts);
    await setDoc(doc(db, 'emergency_contacts', userId), {
      userId,
      contacts: encrypted,
    });
  } catch { return null; }
}

export async function getEmergencyContacts(userId) {
  try {
    const snap = await getDoc(doc(db, 'emergency_contacts', userId));
    if (!snap.exists()) return [];
    return decryptContacts(snap.data().contacts || []);
  } catch { return []; }
}

// ── SETTINGS ───────────────────────────────────

export async function saveUserSettings(userId, settings) {
  try {
    await setDoc(doc(db, 'user_settings', userId), { ...settings, userId });
  } catch { return null; }
}

export async function getUserSettings(userId) {
  try {
    const snap = await getDoc(doc(db, 'user_settings', userId));
    if (!snap.exists()) return null;
    return snap.data();
  } catch { return null; }
}

// ── ACCOUNT DELETION ─────────────────────────────

export async function deleteAllUserData(userId) {
  try {
    await deleteAllAssessments(userId);
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', userId));
    batch.delete(doc(db, 'emergency_contacts', userId));
    batch.delete(doc(db, 'user_settings', userId));
    await batch.commit();
  } catch { return null; }
}
