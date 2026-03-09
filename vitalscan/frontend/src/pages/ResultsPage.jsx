import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Dashboard from '../components/results/Dashboard';
import { generateVitalScanReport } from '../utils/generateReport';
import { useAuth } from '../context/AuthContext';
import { sendEmergencyAlert, sendResultsEmail } from '../services/emailService';
import { saveAssessment, getEmergencyContacts } from '../services/firestoreService';
import { FiArrowLeft } from 'react-icons/fi';

export default function ResultsPage() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const { isDemo, user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [hasContacts, setHasContacts] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const savedRef = useRef(false);
  const alertRef = useRef(false);
  const emailRef = useRef(false);

  const needsAlert = state.results && (
    state.results.heartRisk >= 70 ||
    state.results.diabetesRisk >= 70 ||
    state.results.obesityRisk >= 70
  );

  useEffect(() => {
    if (!state.results) {
      navigate('/assessment');
    }
  }, [state.results, navigate]);

  // Send emergency alert — fetch contacts from Firestore (not form state)
  useEffect(() => {
    if (!state.results || !needsAlert || isDemo || !user || alertRef.current) return;
    alertRef.current = true;

    const checkAndAlert = async () => {
      try {
        const contacts = await getEmergencyContacts(user.uid);
        const eligible = (contacts || []).filter((c) => c.email?.trim());
        if (eligible.length > 0) {
          setHasContacts(true);
          await sendEmergencyAlert(user, state.results, eligible);
          setAlertSent(true);
        }
      } catch (err) {
        console.error('[ResultsPage] Emergency alert flow failed:', err);
      }
    };

    checkAndAlert();
  }, [state.results]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save assessment to Firestore once (real users only)
  useEffect(() => {
    if (state.results && !isDemo && user && !savedRef.current) {
      savedRef.current = true;
      saveAssessment(user.uid, {
        heartRisk: state.results.heartRisk,
        diabetesRisk: state.results.diabetesRisk,
        obesityRisk: state.results.obesityRisk,
        inputs: state.formData || {},
      }).catch(() => {});
    }
  }, [state.results]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send results email once (real users only)
  useEffect(() => {
    if (!state.results || isDemo || !user || emailRef.current) return;
    emailRef.current = true;
    sendResultsEmail(user, state.results, state.results.actionPlan)
      .then((res) => {
        if (res) {
          setEmailSent(true);
          setTimeout(() => setEmailSent(false), 5000);
        }
      })
      .catch(() => {});
  }, [state.results]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state.results) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateVitalScanReport(state.results, null, state.formData);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="min-h-screen pt-24 pb-16 px-4">
      {/* Back to Dashboard */}
      <div className="max-w-7xl mx-auto mb-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-neon-500 text-sm hover:opacity-80 transition-opacity"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <FiArrowLeft size={15} />
          Back to Dashboard
        </button>
      </div>

      {/* Auth banner */}
      {isDemo ? (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex items-center justify-between gap-4 bg-amber-400/10 border border-amber-400/30 rounded-xl px-5 py-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
              <span>⚡</span>
              <span>You&apos;re in Demo Mode — results are not saved to your account.</span>
            </div>
            <Link
              to="/auth"
              className="shrink-0 text-xs font-bold bg-amber-400 text-darkbg px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex items-center gap-2 bg-neon-500/10 border border-neon-500/30 rounded-xl px-5 py-3 text-neon-500 text-sm font-medium">
            <span>✓</span>
            <span>Your results have been saved to your account.</span>
          </div>
        </div>
      )}

      {/* Emergency alert banners */}
      {needsAlert && !isDemo && (
        <div className="max-w-7xl mx-auto mb-4">
          {alertSent && hasContacts ? (
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl px-5 py-4 border"
              style={{ background: '#1a0d00', borderColor: '#F59E0B' }}
            >
              <span className="text-lg shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="text-amber-400 font-semibold text-sm">High Risk Detected</p>
                <p className="text-amber-300/80 text-xs mt-0.5">
                  Emergency alert sent to your family ✅ — Please consult a doctor this week.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl px-5 py-4 border"
              style={{ background: '#1a0d00', borderColor: '#F59E0B' }}
            >
              <span className="text-lg shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="text-amber-400 font-semibold text-sm">High Risk Detected</p>
                <p className="text-amber-300/80 text-xs mt-0.5">
                  Add family contacts in the assessment to alert them automatically.
                </p>
              </div>
              <Link
                to="/assessment"
                className="shrink-0 text-xs font-bold border border-amber-400/50 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-colors"
              >
                Update Assessment
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Results emailed banner */}
      {emailSent && !isDemo && (
        <div
          id="email-banner"
          className="max-w-7xl mx-auto mb-4 flex items-center gap-3 rounded-xl px-5 py-3 border text-sm font-medium"
          style={{ background: '#0a1f0e', borderColor: '#00DC78', color: '#00DC78' }}
        >
          <span>✅</span>
          <span>Results emailed to <strong>{user?.email}</strong></span>
        </div>
      )}

      <Dashboard results={state.results} formData={state.formData} />

      <div className="max-w-7xl mx-auto mt-10">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-bold text-base transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(0,220,120,0.3)]"
        >
          {downloading ? 'Generating PDF...' : '\uD83D\uDCC4 Download PDF Report'}
        </button>
      </div>
    </section>
  );
}
