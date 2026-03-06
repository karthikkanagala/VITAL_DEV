import { motion } from 'framer-motion';
import { FiClipboard, FiCpu, FiBarChart2 } from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const steps = [
  {
    icon: FiClipboard,
    step: '01',
    title: 'Answer 12 Questions',
    desc: 'Basic info like age, BMI, smoking status, and activity level. No lab tests required.',
    color: 'bg-neon-500/10 border-neon-500/20 text-neon-500',
  },
  {
    icon: FiCpu,
    step: '02',
    title: 'AI Analyzes Your Risk',
    desc: 'Our HistGradientBoosting model trained on 250k+ records processes your data in real-time.',
    color: 'bg-teal-500/10 border-teal-500/20 text-teal-500',
  },
  {
    icon: FiBarChart2,
    step: '03',
    title: 'Get Your Action Plan',
    desc: 'Risk scores, interactive simulations, and a prioritized list of lifestyle actions.',
    color: 'bg-neon-500/10 border-neon-500/20 text-neon-500',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-padding dark:bg-darkcard/40 bg-lightbg/60">
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
            How <span className="gradient-text">VitalScan</span> Works
          </h2>
          <p className="dark:text-darksub text-lightsub max-w-xl mx-auto text-lg">
            Three simple steps — no doctor visit, no lab tests, no cost.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Connector */}
          <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] border-t-2 border-dashed dark:border-darkborder border-lightborder" />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border p-8 text-center dark:bg-darkcard bg-white dark:border-darkborder border-lightborder hover:-translate-y-1 hover:border-neon-500/40 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-full ${s.color} border flex items-center justify-center mx-auto mb-6`}>
                  <s.icon className="text-2xl" />
                </div>
                <span className="text-xs text-neon-500 font-bold tracking-widest">STEP {s.step}</span>
                <h3 className="text-xl font-semibold mt-2 mb-3 dark:text-darktext text-lighttext">{s.title}</h3>
                <p className="dark:text-darksub text-lightsub text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
