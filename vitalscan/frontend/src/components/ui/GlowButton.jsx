import { motion } from 'framer-motion';

export default function GlowButton({ children, size = 'md', onClick, disabled }) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`${sizes[size]} rounded-lg bg-neon-500 hover:bg-neon-400 text-dark-950 font-semibold 
        shadow-lg shadow-neon-500/25 hover:shadow-neon-400/40 
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        animate-glow-pulse`}
    >
      {children}
    </motion.button>
  );
}
