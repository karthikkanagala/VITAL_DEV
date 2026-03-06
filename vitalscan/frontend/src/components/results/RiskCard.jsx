import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiDroplet, FiTrendingUp } from 'react-icons/fi';

const iconMap = {
  heart: FiHeart,
  diabetes: FiDroplet,
  obesity: FiTrendingUp,
};

const topColors = {
  heart: '#ef4444',
  diabetes: '#00DC78',
  obesity: '#f59e0b',
};

function gaugeColor(value) {
  if (value >= 70) return '#ef4444';
  if (value >= 45) return '#f59e0b';
  return '#00DC78';
}

function riskBadge(value) {
  if (value >= 70) return { label: 'HIGH', cls: 'bg-red-500/20 text-red-400 border-red-500/40' };
  if (value >= 45) return { label: 'MODERATE', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
  return { label: 'LOW', cls: 'bg-green-500/20 text-green-400 border-green-500/40' };
}

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

function SemiGauge({ value, size = 160 }) {
  const r = 60;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const circumference = Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const color = gaugeColor(value);
  const displayVal = useCountUp(value);

  return (
    <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`} className="mx-auto">
      {/* background arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        className="dark:stroke-darkborder stroke-lightborder"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* value arc */}
      <motion.path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      {/* center text */}
      <text x={cx} y={cy - 15} textAnchor="middle" className="text-3xl font-extrabold dark:fill-darktext fill-lighttext" fontSize="28">
        {displayVal}%
      </text>
    </svg>
  );
}

export default function RiskCard({ label, risk, riskLabel, type, factors = [], delay = 0 }) {
  const Icon = iconMap[type] || FiHeart;
  const color = topColors[type] || '#00DC78';
  const badge = riskBadge(risk);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="dark:bg-darkcard bg-white rounded-2xl border dark:border-darkborder border-lightborder shadow-xl dark:shadow-none overflow-hidden"
    >
      {/* top color bar */}
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Icon size={18} style={{ color }} />
          <h3 className="text-sm font-medium dark:text-darksub text-lightsub">{label}</h3>
        </div>

        <SemiGauge value={risk} />

        {/* risk badge */}
        <div className="text-center mt-2 mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {factors.length > 0 && (
          <div>
            <p className="text-[10px] dark:text-darksub text-lightsub mb-2 uppercase tracking-wider">Key Factors</p>
            <div className="flex flex-wrap gap-1.5">
              {factors.map((f) => (
                <span key={f} className="text-[10px] px-2 py-1 rounded-full dark:bg-[#1A2A1E] dark:text-[#A0B0A5] bg-lightbg text-lightsub">{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
