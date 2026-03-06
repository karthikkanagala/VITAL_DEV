import { motion } from 'framer-motion';
import AnimatedCounter from '../ui/AnimatedCounter';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const stats = [
  { value: 77000000, label: 'Indians Living with Diabetes', suffix: '+', format: true },
  { value: 28, label: 'Urban Obesity Rate', suffix: '%', format: false },
  { value: 82, label: 'Model Accuracy', suffix: '%', format: false },
  { value: 0, label: 'Lab Tests Required', suffix: '', format: false, isZero: true },
];

export default function StatsSection() {
  return (
    <section className="section-padding bg-gradient-to-b dark:from-darkbg dark:via-darkcard dark:to-darkbg from-lightbg via-white to-lightbg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 dark:text-darktext text-lighttext">
            The Numbers That <span className="text-danger-400">Matter</span>
          </h2>
          <p className="dark:text-darksub text-lightsub max-w-lg mx-auto">
            India&apos;s health crisis in perspective — and why early screening saves lives.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-extrabold gradient-text mb-2">
                {s.isZero ? '0' : <AnimatedCounter to={s.value} format={s.format} />}
                {s.suffix}
              </div>
              <p className="dark:text-darksub text-lightsub text-sm">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
