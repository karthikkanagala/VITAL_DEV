import CryptoJS from 'crypto-js';

const KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export function encrypt(data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(str, KEY).toString();
}

export function decrypt(encryptedStr) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedStr, KEY);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    try { return JSON.parse(result); } catch { return result; }
  } catch {
    return null;
  }
}

// Encrypt full user profile object
export function encryptProfile(profile) {
  return {
    displayName: profile.displayName || '',
    email: profile.email || '',
    photoURL: profile.photoURL || '',
    city: profile.city || '',
    state: profile.state || '',
    createdAt: profile.createdAt || null,
    // sensitive fields → AES encrypted
    phone: profile.phone ? encrypt(profile.phone) : '',
    age: profile.age ? encrypt(String(profile.age)) : '',
    sex: profile.sex ? encrypt(profile.sex) : '',
    bloodGroup: profile.bloodGroup ? encrypt(profile.bloodGroup) : '',
  };
}

export function decryptProfile(profile) {
  return {
    ...profile,
    phone: profile.phone ? decrypt(profile.phone) : '',
    age: profile.age ? decrypt(profile.age) : '',
    sex: profile.sex ? decrypt(profile.sex) : '',
    bloodGroup: profile.bloodGroup ? decrypt(profile.bloodGroup) : '',
  };
}

// Encrypt assessment health inputs
export function encryptAssessment(data) {
  return {
    userId: data.userId,
    heartRisk: data.heartRisk,
    diabetesRisk: data.diabetesRisk,
    obesityRisk: data.obesityRisk,
    createdAt: data.createdAt,
    healthData: encrypt(data.inputs),
  };
}

export function decryptAssessment(data) {
  return {
    ...data,
    inputs: data.healthData ? decrypt(data.healthData) : {},
  };
}

// Encrypt emergency contacts array
export function encryptContacts(contacts) {
  return contacts.map((c) => ({
    name: c.name || '',
    relation: c.relation || '',
    phone: c.phone ? encrypt(c.phone) : '',
    email: c.email ? encrypt(c.email) : '',
  }));
}

export function decryptContacts(contacts) {
  return contacts.map((c) => ({
    ...c,
    phone: c.phone ? decrypt(c.phone) : '',
    email: c.email ? decrypt(c.email) : '',
  }));
}
