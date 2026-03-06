import { motion } from 'framer-motion';
import { FiAlertOctagon } from 'react-icons/fi';

const shake = {
  animate: {
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.5, delay: 0.5 },
  },
};

export default function CompoundingAlert({ show, message }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="mb-8 rounded-2xl border overflow-hidden dark:bg-red-950 dark:border-red-500/40 bg-red-50 border-red-300"
    >
      <div className="flex">
        {/* left accent bar */}
        <div className="w-1.5 bg-red-500 flex-shrink-0" />
        <motion.div
          variants={shake}
          animate="animate"
          className="flex items-start gap-4 p-6"
        >
          <FiAlertOctagon className="text-2xl mt-0.5 flex-shrink-0 text-red-400" />
          <div>
            <h3 className="text-lg font-bold dark:text-red-300 text-red-700 mb-2">Compounding Risk Alert</h3>
            <p className="text-sm dark:text-red-300/80 text-red-600/80">{message}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
