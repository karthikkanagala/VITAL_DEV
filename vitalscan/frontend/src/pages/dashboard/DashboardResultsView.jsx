import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBarChart2, FiDownload } from 'react-icons/fi';
import Dashboard from '../../components/results/Dashboard';
import { generateVitalScanReport } from '../../utils/generateReport';

export default function DashboardResultsView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const results = state?.results ?? null;
  const inputs = state?.inputs ?? {};
  const [downloading, setDownloading] = useState(false);

  if (!results) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <p className="text-5xl mb-4">📊</p>
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          No results to display
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Complete an assessment to see your health report here.
        </p>
        <button
          onClick={() => navigate('/dashboard/new')}
          className="px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ background: '#00DC78', color: '#0a0a0a' }}
        >
          Start Assessment →
        </button>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateVitalScanReport(results, null, inputs);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: '#00DC78', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <FiArrowLeft size={15} />
          Back to Overview
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/assessments')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:border-neon-500"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
          >
            <FiBarChart2 size={15} />
            View History
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-60"
            style={{ background: '#00DC78', color: '#0a0a0a' }}
          >
            <FiDownload size={15} />
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Results dashboard */}
      <Dashboard results={results} formData={inputs} />
    </div>
  );
}
