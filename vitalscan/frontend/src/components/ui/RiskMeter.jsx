import { motion } from 'framer-motion';

const colorStyles = {
  blue: { track: 'bg-blue-900/30', fill: 'bg-blue-500', glow: 'shadow-blue-500/50' },
  red: { track: 'bg-red-900/30', fill: 'bg-red-500', glow: 'shadow-red-500/50' },
  purple: { track: 'bg-purple-900/30', fill: 'bg-purple-500', glow: 'shadow-purple-500/50' },
};

export default function RiskMeter({ value, color = 'blue' }) {
  const c = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`w-full h-3 rounded-full ${c.track} overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className={`h-full rounded-full ${c.fill} shadow-lg ${c.glow}`}
      />
    </div>
  );
}
