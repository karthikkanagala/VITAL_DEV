import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import useTheme from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-14 h-7 rounded-full border transition-colors duration-300 flex items-center px-1 ${
        isDark
          ? 'bg-darkcard border-neon-500/30'
          : 'bg-lightcard border-teal-500/30'
      }`}
    >
      {/* Sliding circle */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
          isDark
            ? 'bg-neon-500 ml-auto'
            : 'bg-teal-500 ml-0'
        }`}
      >
        {isDark ? (
          <FiMoon className="text-dark-950 text-xs" />
        ) : (
          <FiSun className="text-white text-xs" />
        )}
      </motion.div>
    </button>
  );
}
