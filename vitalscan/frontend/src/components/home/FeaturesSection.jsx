import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const features = [
  {
    emoji: '🛡️',
    title: 'Multi-Disease Prediction',
    desc: 'Simultaneous risk analysis for diabetes, heart disease, and stroke in one assessment.',
  },
  {
    emoji: '⚡',
    title: 'Compounding Risk Detection',
    desc: 'Identifies how multiple risks interact and exponentially amplify each other.',
  },
  {
    emoji: '🎛️',
    title: 'Live Risk Simulation',
    desc: 'Adjust health metrics in real-time and watch your risk scores change instantly.',
  },
  {
    emoji: '📄',
    title: 'PDF Health Report',
    desc: 'Download a comprehensive report with charts, scores, and recommendations.',
  },
  {
    emoji: '📈',
    title: 'Personalized Action Plan',
    desc: 'Priority-ranked lifestyle changes tailored to your specific risk factors.',
  },
  {
    emoji: '🔒',
    title: 'Privacy First',
    desc: 'Zero data stored permanently. Your health information stays on your device.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="section-padding dark:bg-darkbg bg-lightbg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 dark:text-darktext text-lighttext">
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p className="dark:text-darksub text-lightsub max-w-xl mx-auto text-lg">
            Everything you need to understand and improve your health outlook.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border p-7 cursor-default group dark:bg-darkcard bg-white dark:border-darkborder border-lightborder shadow-sm hover:border-neon-500/40 hover:shadow-[0_0_20px_rgba(0,220,120,0.1)] transition-all duration-300"
            >
              <div className="text-3xl mb-5">{f.emoji}</div>
              <h3 className="font-semibold mb-2 dark:text-darktext text-lighttext">{f.title}</h3>
              <p className="dark:text-darksub text-lightsub text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
