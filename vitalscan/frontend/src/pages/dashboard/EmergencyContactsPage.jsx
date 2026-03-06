import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiPlus, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { saveEmergencyContacts, getEmergencyContacts } from '../../services/firestoreService';

const RELATION_OPTIONS = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Doctor', 'Other'];

const emptyContact = () => ({ name: '', relation: 'Parent', phone: '', email: '' });

function ContactCard({ contact, index, onChange, onRemove }) {
  const inputCls =
    'w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neon-500 transition-colors';
  const inputStyle = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--input-text)',
  };
  const labelStyle = { color: 'var(--text-muted)', fontSize: 12, marginBottom: 6, fontWeight: 500, display: 'block' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl p-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Contact {index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <FiTrash2 size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Name</label>
          <input
            className={inputCls}
            style={inputStyle}
            type="text"
            placeholder="Contact name"
            value={contact.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Relation</label>
          <select
            className={inputCls}
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={contact.relation}
            onChange={(e) => onChange('relation', e.target.value)}
          >
            {RELATION_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Phone</label>
          <input
            className={inputCls}
            style={inputStyle}
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={contact.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            className={inputCls}
            style={inputStyle}
            type="email"
            placeholder="contact@email.com"
            value={contact.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function EmergencyContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([emptyContact()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user) return;
    getEmergencyContacts(user.uid).then((existing) => {
      if (existing && existing.length > 0) {
        setContacts(existing.map((c) => ({ ...emptyContact(), ...c })));
      }
      setLoading(false);
    });
  }, [user]);

  const updateContact = (index, key, value) => {
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)));
  };

  const addContact = () => {
    if (contacts.length < 3) setContacts((prev) => [...prev, emptyContact()]);
  };

  const removeContact = (index) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveEmergencyContacts(user.uid, contacts);
      setToast('✅ Contacts saved and encrypted');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('❌ Failed to save. Please try again.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Emergency Contacts</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Added contacts will be alerted if your risk score reaches 70% or above
        </p>
      </div>

      {/* Warning banner */}
      <div
        className="flex items-start gap-3 rounded-xl px-5 py-4 mb-6"
        style={{ background: '#1a0d00', border: '1px solid #F59E0B' }}
      >
        <span className="text-amber-400 shrink-0 mt-0.5">⚠️</span>
        <p className="text-amber-300/80 text-sm">
          Emails are encrypted with AES-256 and never shared with third parties.
        </p>
      </div>

      {/* Contact cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {contacts.map((contact, i) => (
              <ContactCard
                key={i}
                contact={contact}
                index={i}
                onChange={(key, val) => updateContact(i, key, val)}
                onRemove={() => removeContact(i)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add contact */}
      {!loading && contacts.length < 3 && (
        <button
          onClick={addContact}
          className="mt-4 flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: '#00DC78', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <FiPlus size={16} />
          Add Another Contact
          <span className="text-[#444] font-normal">({contacts.length}/3)</span>
        </button>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-sm font-medium px-4 py-2.5 rounded-xl"
            style={{
              background: toast.startsWith('✅') ? '#0d2010' : '#1a0808',
              color: toast.startsWith('✅') ? '#00DC78' : '#ef4444',
              border: `1px solid ${toast.startsWith('✅') ? '#00DC7833' : '#ef444433'}`,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neon-500 hover:bg-neon-400 text-darkbg font-bold text-sm transition-colors disabled:opacity-50"
      >
        <FiSave size={15} />
        {saving ? 'Saving…' : '💾 Save Contacts'}
      </button>
    </div>
  );
}
