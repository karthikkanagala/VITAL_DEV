import { motion } from 'framer-motion';
import { FiShield, FiHeart, FiActivity } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <section className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">About VitalScan</h1>
          <p className="dark:text-gray-400 text-gray-600 text-lg max-w-2xl mx-auto">
            VitalScan uses machine learning to predict health risks for diabetes,
            heart disease, and stroke based on your personal health metrics.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: FiShield, title: 'Privacy First', desc: 'Your health data is processed securely and never stored without consent.' },
            { icon: FiHeart, title: 'AI-Powered', desc: 'HistGradientBoosting models trained on comprehensive health datasets.' },
            { icon: FiActivity, title: 'Actionable', desc: 'Get personalized action plans, not just numbers.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i }}
              className="glass p-6 text-center"
            >
              <item.icon className="text-primary-400 text-3xl mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2 dark:text-white text-lighttext">{item.title}</h3>
              <p className="dark:text-gray-400 text-gray-600 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass p-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white text-lighttext">How It Works</h2>
          <div className="space-y-4 dark:text-gray-300 text-gray-700">
            <p>
              VitalScan analyzes 19 health indicators including blood pressure, cholesterol,
              blood glucose, BMI, lifestyle factors, and family history to predict your risk
              for three major conditions.
            </p>
            <p>
              Our model uses <strong className="dark:text-white text-gray-900">HistGradientBoostingClassifier</strong> from
              scikit-learn, trained on health data with multi-output classification for simultaneous
              prediction of diabetes, heart disease, and stroke risk.
            </p>
            <p>
              The <strong className="dark:text-white text-gray-900">compounding risk</strong> algorithm identifies when
              multiple risk factors interact, amplifying overall health danger beyond individual risks.
            </p>
            <p className="text-sm dark:text-gray-500 text-gray-500 mt-6">
              ⚠️ Disclaimer: VitalScan is an educational tool and does not replace professional
              medical advice. Always consult your healthcare provider for medical decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
