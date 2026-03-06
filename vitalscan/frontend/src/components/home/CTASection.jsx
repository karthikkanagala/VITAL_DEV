import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlowButton from '../ui/GlowButton';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-b dark:from-[#0F1610] dark:to-[#080A08] from-[#F0FAF4] to-[#DCFCE7]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 dark:text-darktext text-lighttext">
            Ready to Know Your <span className="gradient-text">Risk</span>?
          </h2>
          <p className="dark:text-darksub text-lightsub max-w-lg mx-auto mb-10 text-lg">
            Don&apos;t wait for symptoms. Get your personalized risk assessment in
            under 5 minutes — completely free, no sign-up required.
          </p>
          <Link to="/auth">
            <GlowButton size="lg">Start Your Free Assessment →</GlowButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
