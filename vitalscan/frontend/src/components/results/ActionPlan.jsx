import { motion } from 'framer-motion';

const cardStyles = [
  { accent: '#ef4444', base: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-500/30' },
  { accent: '#f59e0b', base: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-500/30' },
  { accent: '#06b6d4', base: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-500/30' },
];

export default function ActionPlan({ actions }) {
  if (!actions?.length) return null;

  const top3 = actions.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className="text-lg font-semibold dark:text-darktext text-lighttext mb-1">Personalized Action Plan</h3>
      <p className="dark:text-darksub text-lightsub text-xs mb-6">Top priority recommendations based on your risk profile</p>

      <div className="grid md:grid-cols-3 gap-4">
        {top3.map((action, i) => {
          const style = cardStyles[i] || cardStyles[2];
          const text = typeof action === 'string' ? action : action.action || '';
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.2 }}
              className={`rounded-xl p-5 border relative overflow-hidden ${style.base}`}
            >
              {/* accent stripe */}
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: style.accent }} />

              <span className="text-xl font-extrabold mb-3 block" style={{ color: style.accent }}>
                {String(i + 1).padStart(2, '0')}
              </span>

              <p className="text-sm font-semibold dark:text-darktext text-lighttext leading-snug">{text}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
