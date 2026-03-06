import { motion } from 'framer-motion';

export default function LoadingPulse() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-8">
      {/* heartbeat line animation */}
      <div className="relative w-48 h-16">
        <svg viewBox="0 0 200 60" className="w-full h-full">
          <motion.polyline
            points="0,30 40,30 50,30 60,10 70,50 80,30 90,30 130,30 140,30 150,10 160,50 170,30 200,30"
            fill="none"
            stroke="#00DC78"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0.3 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <div className="text-center">
        <p className="dark:text-darktext text-lighttext font-medium">Analyzing your health profile...</p>
        <p className="dark:text-darksub text-lightsub text-sm mt-1">Running ML predictions across 3 models</p>
      </div>
    </div>
  );
}
