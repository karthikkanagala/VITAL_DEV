import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import useSimulation from '../../hooks/useSimulation';

const sliderConfig = [
  { field: 'physical_activity', label: 'Activity', min: 0, max: 3, step: 1, labels: ['Sedentary', 'Light', 'Moderate', 'Active'] },
  { field: 'sleep_hours', label: 'Sleep', min: 4, max: 10, step: 0.5, unit: 'hrs' },
  { field: 'stress_level', label: 'Stress', min: 0, max: 2, step: 1, labels: ['Low', 'Moderate', 'High'] },
  { field: 'smoking_status', label: 'Smoking', min: 0, max: 2, step: 1, labels: ['Never', 'Former', 'Current'] },
  { field: 'sugar_intake', label: 'Sugar', min: 0, max: 2, step: 1, labels: ['Low', 'Moderate', 'High'] },
];

function DeltaBadge({ original, simulated }) {
  const diff = simulated - original;
  if (Math.abs(diff) < 0.5) return <span className="text-xs dark:text-darksub text-lightsub">&mdash;</span>;
  const isUp = diff > 0;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isUp ? 'text-red-400 bg-red-500/20' : 'text-green-400 bg-green-500/20'}`}>
      {isUp ? '\u2191' : '\u2193'} {Math.abs(diff).toFixed(0)}%
    </span>
  );
}

export default function SimulationSlider({ formData, originalResults }) {
  const [values, setValues] = useState({});
  const { simulate, result, loading } = useSimulation();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (formData) {
      const init = {};
      sliderConfig.forEach((s) => {
        init[s.field] = Number(formData[s.field]) || s.min;
      });
      setValues(init);
    }
  }, [formData]);

  const handleChange = useCallback(
    (field, val) => {
      const next = { ...values, [field]: Number(val) };
      setValues(next);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (formData) {
          const modified = { ...formData, [field]: Number(val) };
          simulate(modified);
        }
      }, 300);
    },
    [values, formData, simulate]
  );

  const displayValue = (slider, val) => {
    if (slider.labels) return slider.labels[Math.round(val) - slider.min] || val;
    if (slider.unit) return `${val} ${slider.unit}`;
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="dark:bg-darkcard bg-white rounded-2xl p-6 border dark:border-darkborder border-lightborder shadow-xl dark:shadow-none"
    >
      <h3 className="text-lg font-semibold dark:text-darktext text-lighttext mb-1">Live Risk Simulation</h3>
      <p className="dark:text-darksub text-lightsub text-xs mb-6">Adjust any slider to see real-time impact on your risks</p>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
        {sliderConfig.map((s) => (
          <div key={s.field} className={s.field === 'sugar_intake' ? 'sm:col-span-2 sm:max-w-[calc(50%-12px)]' : ''}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="dark:text-darksub text-lightsub">{s.label}</span>
              <span className="text-primary font-bold text-xs">
                {displayValue(s, values[s.field] ?? s.min)}
              </span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={values[s.field] ?? s.min}
              onChange={(e) => handleChange(s.field, e.target.value)}
              className="w-full accent-primary h-1.5"
            />
            <div className="flex justify-between text-[10px] dark:text-darksub text-lightsub mt-0.5">
              <span>{s.labels ? s.labels[0] : s.min}</span>
              <span>{s.labels ? s.labels[s.labels.length - 1] : s.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Delta results */}
      {result && originalResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 pt-4 border-t dark:border-darkborder border-lightborder space-y-2"
        >
          <p className="text-[10px] dark:text-darksub text-lightsub uppercase tracking-wider mb-2">Simulated Impact</p>
          {[
            { key: 'heartRisk', label: 'Heart Disease' },
            { key: 'diabetesRisk', label: 'Diabetes' },
            { key: 'obesityRisk', label: 'Obesity' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="dark:text-darksub text-lightsub">{label}</span>
              <div className="flex items-center gap-3">
                <span className="dark:text-darksub text-lightsub text-xs">{originalResults[key]}%</span>
                <span className="dark:text-darkborder text-lightborder">&rarr;</span>
                <span className="dark:text-darktext text-lighttext font-semibold text-xs">{result[key]}%</span>
                <DeltaBadge original={originalResults[key]} simulated={result[key]} />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {loading && (
        <div className="mt-4 text-center text-xs dark:text-darksub text-lightsub animate-pulse">Recalculating...</div>
      )}
    </motion.div>
  );
}
