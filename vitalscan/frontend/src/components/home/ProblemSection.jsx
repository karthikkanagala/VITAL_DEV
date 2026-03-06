import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const chainCards = [
  {
    emoji: '🍔',
    title: 'Obesity',
    desc: 'Excess weight triggers insulin resistance and chronic inflammation throughout the body.',
    stat: '28%',
    statLabel: 'Urban India obesity rate',
    darkBg: 'bg-[#1A1000]',
    lightBg: 'bg-[#FFFBEB]',
    glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    accent: 'text-warning-400',
    borderColor: 'border-warning-500/30',
  },
  {
    emoji: '🩸',
    title: 'Diabetes',
    desc: 'Uncontrolled blood sugar damages blood vessels, nerves, and vital organs silently.',
    stat: '77M+',
    statLabel: 'Indians living with diabetes',
    darkBg: 'bg-[#0F1610]',
    lightBg: 'bg-[#F0FAF4]',
    glowColor: 'shadow-[0_0_30px_rgba(0,220,120,0.15)]',
    accent: 'text-neon-400',
    borderColor: 'border-neon-500/30',
  },
  {
    emoji: '💔',
    title: 'Heart Disease',
    desc: 'Damaged arteries and high blood pressure lead to heart attack and stroke.',
    stat: '#1',
    statLabel: 'Cause of death in India',
    darkBg: 'bg-[#1A0A0A]',
    lightBg: 'bg-[#FEF2F2]',
    glowColor: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]',
    accent: 'text-danger-400',
    borderColor: 'border-danger-500/30',
  },
];

const PulsingArrow = () => (
  <div className="hidden md:flex items-center justify-center">
    <FiArrowRight className="text-3xl text-warning-400 animate-pulse-arrow" />
  </div>
);

export default function ProblemSection() {
  return (
    <section className="section-padding relative dark:bg-darkbg bg-lightbg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 dark:text-darktext text-lighttext">
            The <span className="text-danger-400">Silent</span> Chain Reaction
          </h2>
          <p className="dark:text-darksub text-lightsub max-w-2xl mx-auto text-lg">
            These conditions don&apos;t just coexist — they{' '}
            <span className="dark:text-darktext text-lighttext font-medium">fuel each other</span>. Most tools
            look at only one link. VitalScan sees the full chain.
          </p>
        </motion.div>

        {/* Chain Cards */}
        <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 md:gap-2 items-stretch mt-14">
          {chainCards.map((card, i) => (
            <motion.div key={card.title} className="contents">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className={`rounded-2xl border p-8 dark:${card.darkBg} ${card.lightBg} ${card.borderColor} ${card.glowColor} backdrop-blur-sm flex flex-col hover:scale-[1.02] transition-transform duration-300`}
              >
                <div className="text-4xl mb-4">{card.emoji}</div>
                <h3 className={`text-xl font-bold mb-2 ${card.accent}`}>{card.title}</h3>
                <p className="dark:text-darksub text-lightsub text-sm leading-relaxed mb-6 flex-1">{card.desc}</p>
                <div className="pt-4 border-t dark:border-darkborder border-lightborder">
                  <div className={`text-2xl font-extrabold ${card.accent}`}>{card.stat}</div>
                  <div className="dark:text-darksub text-lightsub text-xs mt-0.5">{card.statLabel}</div>
                </div>
              </motion.div>
              {i < chainCards.length - 1 && <PulsingArrow />}
            </motion.div>
          ))}
        </div>

        {/* Bold tagline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-12 text-lg dark:text-darksub text-lightsub"
        >
          <span className="dark:text-darktext text-lighttext font-semibold">Did you know?</span>{' '}
          Indians develop diabetes <span className="text-neon-500 font-semibold">10 years earlier</span> than
          Western populations. Early screening is{' '}
          <span className="dark:text-darktext text-lighttext font-semibold">critical</span>.
        </motion.p>
      </div>
    </section>
  );
}
