import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingDown, FiTrendingUp, FiMinus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUserAssessments } from '../../services/firestoreService';
import { generateVitalScanReport } from '../../utils/generateReport';

const FILTERS = ['All', 'High Risk', 'Moderate', 'Low Risk'];

function riskLabel(score) {
  if (score >= 70) return 'HIGH RISK';
  if (score >= 45) return 'MODERATE';
  return 'LOW';
}

function riskColor(score) {
  if (score >= 70) return '#ef4444';
  if (score >= 45) return '#f97316';
  return '#22c55e';
}

function borderColor(assessment) {
  const max = Math.max(
    assessment.heartRisk || 0,
    assessment.diabetesRisk || 0,
    assessment.obesityRisk || 0,
  );
  if (max >= 70) return '#ef4444';
  if (max >= 45) return '#f97316';
  return '#22c55e';
}

function formatDate(ts) {
  if (!ts) return '—';
  let d;
  if (ts?.toDate) d = ts.toDate();
  else d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function TrendBadge({ diff }) {
  if (diff === 0 || diff === null || diff === undefined) {
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-gray-400">
        <FiMinus size={11} /> No change
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-green-400">
        <FiTrendingDown size={11} /> {diff}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-red-400">
      <FiTrendingUp size={11} /> +{diff}%
    </span>
  );
}

function TrendSection({ latest, previous }) {
  const heart = (latest.heartRisk || 0) - (previous.heartRisk || 0);
  const diab = (latest.diabetesRisk || 0) - (previous.diabetesRisk || 0);
  const obes = (latest.obesityRisk || 0) - (previous.obesityRisk || 0);

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
        📈 Trend vs Previous Assessment
      </p>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '❤️ Heart', diff: heart },
          { label: '🩸 Diabetes', diff: diab },
          { label: '⚖️ Obesity', diff: obes },
        ].map(({ label, diff }) => (
          <div key={label} className="text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <TrendBadge diff={diff} />
          </div>
        ))}
      </div>
    </div>
  );
}


function AssessmentCard({ assessment, onView, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const bc = borderColor(assessment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 relative"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderLeft: `4px solid ${bc}`,
      }}
    >
      {/* Date */}
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>📅 {formatDate(assessment.createdAt)}</p>

      {/* Risk scores */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '❤️ Heart', score: assessment.heartRisk || 0 },
          { label: '🩸 Diabetes', score: assessment.diabetesRisk || 0 },
          { label: '⚖️ Obesity', score: assessment.obesityRisk || 0 },
        ].map(({ label, score }) => (
          <div key={label} className="text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="font-black text-2xl leading-none" style={{ color: riskColor(score) }}>
              {score}<span className="text-base font-bold">%</span>
            </p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${riskColor(score)}22`, color: riskColor(score) }}
            >
              {riskLabel(score)}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(assessment)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors border"
          style={{ borderColor: 'var(--border-color)', color: '#00DC78', background: '#0d2010' }}
        >
          View Full Report
        </button>
        <button
          onClick={async () => {
            setDownloading(true);
            try {
              await onDownload(assessment);
            } finally {
              setDownloading(false);
            }
          }}
          disabled={downloading}
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors border"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'transparent' }}
        >
          {downloading ? 'Generating…' : '📄 Download PDF'}
        </button>
      </div>
    </motion.div>
  );
}

export default function PreviousAssessmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!user) return;
    getUserAssessments(user.uid).then((data) => {
      setAssessments(data || []);
      setLoading(false);
    });
  }, [user]);

  const filtered = assessments.filter((a) => {
    const max = Math.max(a.heartRisk || 0, a.diabetesRisk || 0, a.obesityRisk || 0);
    if (filter === 'High Risk') return max >= 70;
    if (filter === 'Moderate') return max >= 45 && max < 70;
    if (filter === 'Low Risk') return max < 45;
    return true;
  });

  const handleView = (assessment) => {
    const results = {
      heartRisk: assessment.heartRisk,
      diabetesRisk: assessment.diabetesRisk,
      obesityRisk: assessment.obesityRisk,
    };
    navigate('/dashboard/results', { state: { results, inputs: assessment.inputs || {} } });
  };

  const handleDownload = async (assessment) => {
    const results = {
      heartRisk: assessment.heartRisk,
      diabetesRisk: assessment.diabetesRisk,
      obesityRisk: assessment.obesityRisk,
    };
    await generateVitalScanReport(results, null, assessment.healthData || {});
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>My Assessments</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your complete health history</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border"
            style={{
              background: filter === f ? '#0d2010' : 'transparent',
              borderColor: filter === f ? '#00DC78' : 'var(--border-color)',
              color: filter === f ? '#00DC78' : 'var(--text-muted)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-center rounded-2xl py-16 px-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <p className="text-5xl mb-4">📊</p>
          <p className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
            {assessments.length === 0 ? 'No assessments yet' : 'No matching assessments'}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {assessments.length === 0
              ? 'Take your first health assessment to see results here.'
              : 'Try a different filter.'}
          </p>
          {assessments.length === 0 && (
            <button
              onClick={() => navigate('/dashboard/new')}
              className="px-6 py-3 rounded-xl bg-neon-500 hover:bg-neon-400 text-darkbg font-bold text-sm transition-colors"
            >
              Start Assessment →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Trend section — shown when there are 2+ assessments */}
          {assessments.length >= 2 && filter === 'All' && (
            <TrendSection latest={assessments[0]} previous={assessments[1]} />
          )}
          <AnimatePresence>
            {filtered.map((a) => (
              <AssessmentCard
                key={a.id}
                assessment={a}
                onView={handleView}
                onDownload={handleDownload}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
