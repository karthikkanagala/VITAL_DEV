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
  const encrypted = encryptProfile({
    ...userData,
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'users', userId), encrypted);
}

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return decryptProfile(snap.data());
}

export async function updateUserProfile(userId, updates) {
  const current = await getUserProfile(userId);
  const merged = { ...current, ...updates };
  const encrypted = encryptProfile(merged);
  await updateDoc(doc(db, 'users', userId), encrypted);
}

// ── ASSESSMENTS ─────────────────────────────────

export async function saveAssessment(userId, data) {
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
}

export async function getUserAssessments(userId) {
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
}

export async function deleteAllAssessments(userId) {
  const q = query(collection(db, 'assessments'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ── EMERGENCY CONTACTS ────────────────────────────

export async function saveEmergencyContacts(userId, contacts) {
  const encrypted = encryptContacts(contacts);
  await setDoc(doc(db, 'emergency_contacts', userId), {
    userId,
    contacts: encrypted,
  });
}

export async function getEmergencyContacts(userId) {
  const snap = await getDoc(doc(db, 'emergency_contacts', userId));
  if (!snap.exists()) return [];
  return decryptContacts(snap.data().contacts || []);
}

// ── SETTINGS ───────────────────────────────────

export async function saveUserSettings(userId, settings) {
  await setDoc(doc(db, 'user_settings', userId), { ...settings, userId });
}

export async function getUserSettings(userId) {
  const snap = await getDoc(doc(db, 'user_settings', userId));
  if (!snap.exists()) return null;
  return snap.data();
}

// ── ACCOUNT DELETION ─────────────────────────────

export async function deleteAllUserData(userId) {
  await deleteAllAssessments(userId);
  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', userId));
  batch.delete(doc(db, 'emergency_contacts', userId));
  batch.delete(doc(db, 'user_settings', userId));
  await batch.commit();
}
