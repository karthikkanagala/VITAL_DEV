import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

/* ── Password strength ──────────────────────────────────────── */
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: 'Too short', color: '#ef4444' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#eab308' },
    { label: 'Good', color: '#22c55e' },
    { label: 'Strong', color: '#00DC78' },
  ];
  return { score, ...levels[score] };
}

/* ── Input field ────────────────────────────────────────────── */
function AuthInput({ icon: Icon, type, placeholder, value, onChange, rightSlot }) {
  return (
    <div className="relative">
      <Icon
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-darksub pointer-events-none"
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-darkcard border border-darkborder text-white placeholder-darksub
                   rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-neon-500
                   transition-colors"
        required
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function AuthPage() {
  const navigate = useNavigate();
  const { signInEmail, signUpEmail, signInGoogle, setDemoUser, resetPassword } = useAuth();

  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState(''); // '' | 'sent' | 'error'
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const strength = getStrength(password);

  const friendly = (code) => {
    const map = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signin') {
        await signInEmail(email, password);
      } else {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        await signUpEmail(email, password, name.trim());
      }
      navigate('/dashboard');
    } catch (err) {
      setError(friendly(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(friendly(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setDemoUser();
    navigate('/assessment');
  };

  const handleBackToHome = () => navigate('/');

  const handleReset = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail.trim()) { setResetError('Please enter your email.'); return; }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      setResetStatus('sent');
    } catch (err) {
      const msg = err.code === 'auth/user-not-found'
        ? 'No account with this email.'
        : err.code === 'auth/invalid-email'
        ? 'Please enter a valid email address.'
        : 'Something went wrong. Please try again.';
      setResetError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-darkbg bg-lightbg flex items-center justify-center px-4 py-24">
      {/* Back to Home */}
      <button
        onClick={handleBackToHome}
        className="fixed top-20 left-6 flex items-center gap-1.5 text-neon-500 text-sm hover:opacity-80 transition-opacity z-10"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <FiArrowLeft size={15} />
        Back to Home
      </button>

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="dark:bg-darkcard bg-white border dark:border-darkborder border-lightborder rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-2 h-2 rounded-sm bg-neon-500" />
            <span className="text-xl font-bold dark:text-white text-lighttext">VITAL</span>
            <span className="text-xl font-bold text-neon-500 -ml-1.5">SCAN</span>
          </Link>

          {/* ── FORGOT PASSWORD VIEW ── */}
          <AnimatePresence mode="wait">
            {showForgot ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => { setShowForgot(false); setResetStatus(''); setResetError(''); setResetEmail(''); }}
                  className="flex items-center gap-1.5 text-xs dark:text-darksub text-lightsub hover:text-neon-500 transition-colors mb-5"
                >
                  <FiArrowLeft size={13} /> Back to Sign In
                </button>
                <h2 className="text-lg font-bold dark:text-white text-lighttext mb-1">Reset Your Password</h2>
                <p className="text-sm dark:text-darksub text-lightsub mb-5">
                  Enter your email address and we&apos;ll send a reset link.
                </p>

                {resetStatus === 'sent' ? (
                  <div className="flex items-center gap-2 text-neon-500 bg-neon-500/10 border border-neon-500/20 rounded-xl px-4 py-3 text-sm font-medium">
                    <span>✅</span>
                    <span>Reset link sent! Check your inbox.</span>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-3">
                    <AuthInput
                      icon={FiMail}
                      type="email"
                      placeholder="Your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <AnimatePresence>
                      {resetError && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                        >
                          <FiAlertCircle size={14} className="shrink-0" />
                          {resetError}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button
                      type="submit"
                      disabled={resetLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-neon-500 hover:bg-neon-400 text-darkbg font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
                    >
                      {resetLoading ? 'Sending…' : 'Send Reset Link'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
              {/* Tabs */}
              <div className="flex rounded-xl overflow-hidden border dark:border-darkborder border-lightborder mb-6 text-sm font-semibold">
                {['signin', 'signup'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(''); }}
                    className={`flex-1 py-2.5 transition-colors ${
                      tab === t
                        ? 'bg-neon-500 text-darkbg'
                        : 'dark:text-darksub text-lightsub hover:dark:text-white hover:text-lighttext'
                    }`}
                  >
                    {t === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                           border dark:border-darkborder border-lightborder
                           dark:text-white text-lighttext text-sm font-medium
                           hover:dark:bg-white/5 hover:bg-black/5 transition-colors mb-4 disabled:opacity-50"
              >
                <FcGoogle size={18} />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 border-t dark:border-darkborder border-lightborder" />
                <span className="text-xs dark:text-darksub text-lightsub">or</span>
                <div className="flex-1 border-t dark:border-darkborder border-lightborder" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <AnimatePresence>
                  {tab === 'signup' && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <AuthInput
                        icon={FiUser}
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AuthInput
                  icon={FiMail}
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <AuthInput
                  icon={FiLock}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="text-darksub hover:text-white transition-colors"
                    >
                      {showPwd ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  }
                />

                {/* Forgot password link — sign in tab only */}
                <AnimatePresence>
                  {tab === 'signin' && (
                    <motion.div
                      key="forgot-link"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-end"
                    >
                      <button
                        type="button"
                        onClick={() => { setShowForgot(true); setResetEmail(email); setResetStatus(''); setResetError(''); }}
                        className="text-xs text-[#888] hover:text-neon-500 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password strength — signup only */}
                <AnimatePresence>
                  {tab === 'signup' && password && (
                    <motion.div
                      key="strength"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-1"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className="flex-1 h-1 rounded-full transition-colors duration-300"
                            style={{
                              backgroundColor: n <= strength.score ? strength.color : '#1e2a1e',
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                    >
                      <FiAlertCircle size={14} className="shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-neon-500 hover:bg-neon-400 text-darkbg font-bold py-3 rounded-xl
                             text-sm transition-colors disabled:opacity-50 mt-1"
                >
                  {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
                </motion.button>
              </form>

              {/* Demo mode */}
              <div className="mt-4 text-center">
                <p className="text-xs dark:text-darksub text-lightsub mb-2">
                  Just exploring? No account needed.
                </p>
                <button
                  onClick={handleDemo}
                  className="text-xs text-neon-500 hover:text-neon-400 font-semibold underline
                             underline-offset-2 transition-colors"
                >
                  ⚡ Continue in Demo Mode
                </button>
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs dark:text-darksub text-lightsub mt-4">
          Your health data is never stored on our servers without consent.
        </p>
      </motion.div>
    </div>
  );
}
