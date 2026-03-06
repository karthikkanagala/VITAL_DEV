import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getUserSettings, saveUserSettings, deleteAllUserData, deleteAllAssessments } from '../../services/firestoreService';
import { deleteUser } from 'firebase/auth';
import { auth } from '../../firebase/config';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none"
      style={{ background: checked ? '#00DC78' : 'var(--border-color)' }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
        style={{ left: checked ? '1.375rem' : '0.25rem' }}
      />
    </button>
  );
}

function SettingRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 last:border-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function PrivacyBadge({ text }) {
  return (
    <div className="flex items-center gap-2 py-3 last:border-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <span className="text-neon-500 text-sm">✅</span>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
  );
}

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  emergencyAlerts: true,
  welcomeBackEmails: true,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Danger zone dialogs
  const [showDeleteAssessments, setShowDeleteAssessments] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [dangerLoading, setDangerLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserSettings(user.uid).then((s) => {
      if (s) {
        setSettings({ ...DEFAULT_SETTINGS, ...s });
      }
      setLoading(false);
    });
  }, [user]);

  const set = (key) => (val) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserSettings(user.uid, settings);
      setToast('✅ Settings saved');
      setTimeout(() => setToast(''), 2500);
    } catch {
      setToast('❌ Failed to save');
      setTimeout(() => setToast(''), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssessments = async () => {
    if (!user) return;
    setDangerLoading(true);
    try {
      await deleteAllAssessments(user.uid);
      setToast('✅ All assessments deleted');
      setShowDeleteAssessments(false);
    } catch {
      setToast('❌ Failed to delete assessments');
    } finally {
      setDangerLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    if (!user) return;
    setDangerLoading(true);
    try {
      await deleteAllUserData(user.uid);
      await deleteUser(auth.currentUser);
      await logout();
      navigate('/');
    } catch (err) {
      setToast('❌ Failed to delete account. Please re-login and try again.');
      setShowDeleteAccount(false);
      setDangerLoading(false);
      setTimeout(() => setToast(''), 4000);
    }
  };

  const sectionCls = 'rounded-2xl p-6 mb-5';
  const sectionStyle = { background: 'var(--bg-card)', border: '1px solid var(--border-color)' };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account and preferences</p>
      </div>

      {/* Account Settings */}
      <div className={sectionCls} style={sectionStyle}>
        <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Account Settings</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Control which emails you receive from VitalScan</p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="space-y-1.5">
                  <div className="h-3 w-32 rounded animate-pulse" style={{ background: 'var(--border-color)' }} />
                  <div className="h-2.5 w-48 rounded animate-pulse" style={{ background: 'var(--border-color)' }} />
                </div>
                <div className="w-10 h-6 rounded-full animate-pulse" style={{ background: 'var(--border-color)' }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            <SettingRow
              label="Email Notifications"
              description="Receive important updates and alerts"
              checked={settings.emailNotifications}
              onChange={set('emailNotifications')}
            />
            <SettingRow
              label="Emergency Alerts"
              description="Notify family contacts when risk reaches 70%+"
              checked={settings.emergencyAlerts}
              onChange={set('emergencyAlerts')}
            />
            <SettingRow
              label="Welcome Back Emails"
              description="Receive a confirmation email on each sign-in"
              checked={settings.welcomeBackEmails}
              onChange={set('welcomeBackEmails')}
            />
          </>
        )}

        {/* Toast */}
        <AnimatePresence>
          {toast && !showDeleteAssessments && !showDeleteAccount && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
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

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="mt-5 px-6 py-2.5 rounded-xl bg-neon-500 hover:bg-neon-400 text-darkbg font-bold text-sm transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* Privacy */}
      <div className={sectionCls} style={sectionStyle}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Privacy & Security</h2>
        <PrivacyBadge text="Your health data is AES-256 encrypted before storage" />
        <PrivacyBadge text="Emergency contact details are encrypted at rest" />
        <PrivacyBadge text="Data stored in Firebase (Google Cloud) servers" />
        <PrivacyBadge text="Your encryption key never leaves your device" />
      </div>

      {/* Danger zone */}
      <div
        className={sectionCls}
        style={{ background: '#120808', border: '1px solid #3a1010' }}
      >
        <h2 className="text-red-400 font-semibold text-sm mb-4">Danger Zone</h2>
        <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>These actions are irreversible. Please be certain.</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowDeleteAssessments(true)}
            className="py-2.5 px-5 rounded-xl text-sm font-semibold border transition-colors"
            style={{ borderColor: '#f97316', color: '#f97316', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9731611')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Delete All Assessments
          </button>

          <button
            onClick={() => setShowDeleteAccount(true)}
            className="py-2.5 px-5 rounded-xl text-sm font-semibold border transition-colors"
            style={{ borderColor: '#ef4444', color: '#ef4444', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ef444411')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* ── Confirm Delete Assessments Dialog ── */}
      <AnimatePresence>
        {showDeleteAssessments && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: 'var(--bg-card)', border: '1px solid #3a1010' }}
            >
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Delete All Assessments?</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                This will permanently delete all your health assessment history. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAssessments(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAssessments}
                  disabled={dangerLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50"
                >
                  {dangerLoading ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm Delete Account Dialog ── */}
      <AnimatePresence>
        {showDeleteAccount && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: 'var(--bg-card)', border: '1px solid #3a1010' }}
            >
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Delete Your Account?</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                This will permanently delete your account and all associated data. This cannot be undone.
              </p>
              <p className="text-sm text-red-400 font-medium mb-2">
                Type <span className="font-mono bg-red-500/10 px-1 rounded">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full mb-4 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                style={{ background: '#120808', border: '1px solid #3a1010', color: 'var(--input-text)' }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteAccount(false); setDeleteConfirmText(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || dangerLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                >
                  {dangerLoading ? 'Deleting…' : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
