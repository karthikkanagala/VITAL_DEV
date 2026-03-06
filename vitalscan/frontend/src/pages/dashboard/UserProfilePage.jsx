import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, createUserProfile, getUserAssessments } from '../../services/firestoreService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Small badge shown under auto-filled fields
function AutoFillBadge() {
  return (
    <span style={{ color: '#00DC78', fontSize: 11, display: 'block', marginTop: 4 }}>
      🔄 Auto-filled from your account
    </span>
  );
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user, resetPassword } = useAuth();

  const [firestoreLoading, setFirestoreLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [autoFilled, setAutoFilled] = useState(new Set());

  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    age: '',
    sex: '',
    bloodGroup: '',
    city: '',
    state: '',
  });

  const [joinedDate, setJoinedDate] = useState('');

  // STEP 1 — Instantly fill from Firebase Auth (no loading wait)
  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      displayName: user.displayName || '',
    }));
    setAutoFilled(new Set(['displayName']));

    if (user.metadata?.creationTime) {
      const d = new Date(user.metadata.creationTime);
      setJoinedDate(d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }

    // STEP 2 — Merge Firestore profile over top
    getUserProfile(user.uid)
      .then((profile) => {
        if (profile) {
          const newFilled = new Set();
          setForm((prev) => {
            const next = { ...prev };
            if (profile.displayName) { next.displayName = profile.displayName; newFilled.add('displayName'); }
            if (profile.phone)       { next.phone       = profile.phone;       newFilled.add('phone'); }
            if (profile.age)         { next.age         = profile.age;         newFilled.add('age'); }
            if (profile.sex)         { next.sex         = profile.sex;         newFilled.add('sex'); }
            if (profile.bloodGroup)  { next.bloodGroup  = profile.bloodGroup;  newFilled.add('bloodGroup'); }
            if (profile.city)        { next.city        = profile.city;        newFilled.add('city'); }
            if (profile.state)       { next.state       = profile.state;       newFilled.add('state'); }
            return next;
          });
          setAutoFilled(newFilled);

          if (profile.createdAt?.toDate) {
            setJoinedDate(
              profile.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            );
          }
        }

        setFirestoreLoading(false);

        // STEP 3 — Assessment fallback for empty age / sex
        setForm((prev) => {
          if (!prev.age || !prev.sex) {
            getUserAssessments(user.uid)
              .then((assessments) => {
                if (!assessments?.length) return;
                const inputs = assessments[0].inputs || assessments[0].healthData || {};
                setForm((p) => {
                  const next = { ...p };
                  const added = new Set();
                  if (!p.age && inputs.age)         { next.age = String(inputs.age); added.add('age'); }
                  if (!p.sex && inputs.sex !== undefined) {
                    const s = inputs.sex === 1 ? 'Male' : inputs.sex === 0 ? 'Female' : '';
                    if (s) { next.sex = s; added.add('sex'); }
                  }
                  if (added.size > 0) setAutoFilled((af) => new Set([...af, ...added]));
                  return next;
                });
              })
              .catch(() => {});
          }
          return prev;
        });
      })
      .catch(() => setFirestoreLoading(false));
  }, [user]);

  // Remove field from autoFilled set when the user manually edits it
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setAutoFilled((af) => { const next = new Set(af); next.delete(key); return next; });
  };

  const setSex = (s) => {
    setForm((f) => ({ ...f, sex: s }));
    setAutoFilled((af) => { const next = new Set(af); next.delete('sex'); return next; });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        await updateUserProfile(user.uid, form);
      } else {
        await createUserProfile(user.uid, {
          ...form,
          email: user.email,
          photoURL: user.photoURL || '',
        });
      }
      setAutoFilled(new Set());
      setToast('✅ Profile saved successfully');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('❌ Failed to save. Please try again.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPwd = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      setResetSent(true);
    } catch {
      // silent
    }
  };

  const inputCls =
    'w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors';

  const inputStyle = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--input-text)',
  };

  const labelStyle = { color: 'var(--text-muted)', fontSize: 12, marginBottom: 6, fontWeight: 500, display: 'block' };
  const cardStyle  = { background: 'var(--bg-card)', border: '1px solid var(--border-color)' };
  const initial    = (user?.displayName || user?.email || 'U')[0].toUpperCase();

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-neon-500 text-sm mb-6 hover:opacity-80 transition-opacity"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <FiArrowLeft size={15} />
        Back to Home
      </button>

      {/* Profile card */}
      <div className="rounded-2xl p-6 mb-6 flex items-center gap-5" style={cardStyle}>
        {user?.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="w-20 h-20 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-neon-500 flex items-center justify-center text-darkbg font-bold text-2xl shrink-0">
            {initial}
          </div>
        )}
        <div>
          <h2 className="font-bold text-xl leading-tight" style={{ color: 'var(--text-primary)' }}>
            {form.displayName || user?.displayName || 'User'}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          {joinedDate && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Joined {joinedDate}</p>}
        </div>
      </div>

      {/* Editable fields */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="font-semibold text-base mb-5" style={{ color: 'var(--text-primary)' }}>Personal Information</h3>

        {firestoreLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 w-24 rounded mb-2" style={{ background: 'var(--border-color)' }} />
                <div className="h-11 rounded-xl" style={{ background: 'var(--border-color)' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label style={labelStyle}>Full Name</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="text"
                placeholder="Your full name"
                value={form.displayName}
                onChange={set('displayName')}
              />
              {autoFilled.has('displayName') && <AutoFillBadge />}
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                onChange={set('phone')}
              />
              {autoFilled.has('phone') && <AutoFillBadge />}
            </div>

            <div>
              <label style={labelStyle}>Age</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="number"
                placeholder="e.g. 28"
                min="1"
                max="120"
                value={form.age}
                onChange={set('age')}
              />
              {autoFilled.has('age') && <AutoFillBadge />}
            </div>

            <div>
              <label style={labelStyle}>Sex</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      background: form.sex === s ? '#0d2010' : 'var(--input-bg)',
                      borderColor: form.sex === s ? '#00DC78' : 'var(--border-color)',
                      color: form.sex === s ? '#00DC78' : 'var(--text-muted)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {autoFilled.has('sex') && <AutoFillBadge />}
            </div>

            <div>
              <label style={labelStyle}>Blood Group</label>
              <select
                className={inputCls}
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.bloodGroup}
                onChange={set('bloodGroup')}
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              {autoFilled.has('bloodGroup') && <AutoFillBadge />}
            </div>

            <div>
              <label style={labelStyle}>City</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="text"
                placeholder="Your city"
                value={form.city}
                onChange={set('city')}
              />
              {autoFilled.has('city') && <AutoFillBadge />}
            </div>

            <div>
              <label style={labelStyle}>State</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="text"
                placeholder="Your state"
                value={form.state}
                onChange={set('state')}
              />
              {autoFilled.has('state') && <AutoFillBadge />}
            </div>
          </div>
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

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || firestoreLoading}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-neon-500 hover:bg-neon-400 text-darkbg font-bold text-sm transition-colors disabled:opacity-50"
          >
            <FiSave size={15} />
            {saving ? 'Saving…' : 'Save Profile'}
          </button>

          <button
            onClick={handleResetPwd}
            disabled={resetSent}
            className="py-3 px-6 rounded-xl text-sm font-medium transition-colors border"
            style={{
              background: 'transparent',
              borderColor: 'var(--border-color)',
              color: resetSent ? '#00DC78' : 'var(--text-muted)',
            }}
          >
            {resetSent ? '✅ Reset email sent' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
