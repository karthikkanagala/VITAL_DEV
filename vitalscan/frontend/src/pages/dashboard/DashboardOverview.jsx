import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlusCircle, FiBarChart2, FiUser, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, getUserAssessments, getEmergencyContacts } from '../../services/firestoreService';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function riskColor(score) {
  if (score >= 70) return '#ef4444';
  if (score >= 45) return '#f97316';
  return '#22c55e';
}

function riskLabel(score) {
  if (score >= 70) return 'High Risk';
  if (score >= 45) return 'Moderate';
  return 'Low Risk';
}

function topRisk(a) {
  return Math.max(a.heartRisk || 0, a.diabetesRisk || 0, a.obesityRisk || 0);
}

function profileCompletion(profile) {
  if (!profile) return 0;
  const fields = ['name', 'phone', 'age', 'sex', 'bloodGroup', 'city', 'state', 'height_cm', 'weight_kg'];
  const filled = fields.filter((f) => profile[f] !== undefined && profile[f] !== '' && profile[f] !== null).length;
  return Math.round((filled / fields.length) * 100);
}

function formatDate(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getUserProfile(user.uid),
      getUserAssessments(user.uid),
      getEmergencyContacts(user.uid),
    ]).then(([p, a, c]) => {
      setProfile(p);
      setAssessments(a || []);
      setContactCount((c || []).length);
      setLoading(false);
    });
  }, [user]);

  const last = assessments[0];
  const prev = assessments[1];
  const completion = profileCompletion(profile);
  const displayName = profile?.name || user?.displayName || 'there';

  return (
    <div className="max-w-3xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {getGreeting()}, {displayName} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {last
            ? `Last assessed on ${formatDate(last.createdAt)}`
            : "Welcome to VitalScan — let's get started."}
        </p>
      </div>

      {/* Last Assessment card or empty welcome */}
      {loading ? (
        <div className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
      ) : last ? (
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderLeft: `4px solid ${riskColor(topRisk(last))}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Latest Assessment
            </p>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDate(last.createdAt)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '❤️ Heart', cur: last.heartRisk || 0, pre: prev?.heartRisk },
              { label: '🩸 Diabetes', cur: last.diabetesRisk || 0, pre: prev?.diabetesRisk },
              { label: '⚖️ Obesity', cur: last.obesityRisk || 0, pre: prev?.obesityRisk },
            ].map(({ label, cur, pre }) => {
              const diff = pre !== undefined ? cur - pre : null;
              return (
                <div key={label} className="text-center">
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="font-black text-2xl leading-none" style={{ color: riskColor(cur) }}>
                    {cur}<span className="text-base font-bold">%</span>
                  </p>
                  {diff !== null && (
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: diff === 0 ? '#9ca3af' : diff > 0 ? '#ef4444' : '#22c55e' }}
                    >
                      {diff === 0 ? '→ No change' : diff > 0 ? `↑ +${diff}%` : `↓ ${diff}%`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/dashboard/assessments')}
            className="mt-4 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: '#00DC78', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            View full history →
          </button>
        </div>
      ) : (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-color)' }}
        >
          <p className="text-5xl mb-3">🏥</p>
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No assessments yet</p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Take your first health risk assessment to get personalized insights.
          </p>
          <button
            onClick={() => navigate('/dashboard/new')}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-colors hover:opacity-90"
            style={{ background: '#00DC78', color: '#0a0a0a' }}
          >
            Start Your First Assessment →
          </button>
        </div>
      )}

      {/* Quick Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Total Assessments',
              value: assessments.length,
              color: '#00DC78',
            },
            {
              label: 'Last Risk Level',
              value: last ? riskLabel(topRisk(last)) : '—',
              color: last ? riskColor(topRisk(last)) : 'var(--text-muted)',
            },
            {
              label: 'Emergency Contacts',
              value: contactCount,
              sub: contactCount === 0 ? 'None set' : `${contactCount} saved`,
            },
          ].map(({ label, value, color, sub }) => (
            <div
              key={label}
              className="rounded-2xl p-5 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <p className="text-3xl font-black mb-1" style={{ color: color || 'var(--text-primary)' }}>
                {value}
              </p>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
              {sub && (
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Profile Completion */}
      {!loading && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Profile Completion
            </p>
            <span
              className="text-sm font-bold"
              style={{ color: completion === 100 ? '#00DC78' : '#f97316' }}
            >
              {completion}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completion}%`,
                background: completion === 100 ? '#00DC78' : '#f97316',
              }}
            />
          </div>
          {completion < 100 && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Complete your profile to enable better auto-fill in assessments.{' '}
              <button
                onClick={() => navigate('/dashboard/profile')}
                className="font-semibold hover:opacity-80"
                style={{ color: '#00DC78', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Update now →
              </button>
            </p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New Assessment', icon: FiPlusCircle, page: 'assessment', primary: true },
            { label: 'View History', icon: FiBarChart2, page: 'assessments', primary: false },
            { label: 'Edit Profile', icon: FiUser, page: 'profile', primary: false },
            { label: 'Emergency', icon: FiAlertTriangle, page: 'emergency', primary: false },
          ].map(({ label, icon: Icon, page, primary }) => (
            <button
              key={page}
              onClick={() => navigate(page === 'assessment' ? '/dashboard/new' : `/dashboard/${page}`)}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
              style={{
                color: primary ? '#00DC78' : 'var(--text-primary)',
                background: primary ? '#0d2010' : 'transparent',
                borderColor: primary ? '#00DC78' : 'var(--border-color)',
              }}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
