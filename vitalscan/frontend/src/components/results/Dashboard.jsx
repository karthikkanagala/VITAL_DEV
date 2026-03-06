import { motion } from 'framer-motion';
import RiskCard from './RiskCard';
import RiskChart from './RiskChart';
import CompoundingAlert from './CompoundingAlert';
import ActionPlan from './ActionPlan';
import SimulationSlider from './SimulationSlider';
import { FiCheckCircle } from 'react-icons/fi';

export default function Dashboard({ results, formData }) {
  const {
    heartRisk, diabetesRisk, obesityRisk,
    heartLabel, diabetesLabel, obesityLabel,
    bmi, compoundingAlert, compoundingMessage,
    heartFactors, diabetesFactors, obesityFactors,
    actionPlan,
  } = results;

  const userName = formData?.name || 'User';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark:bg-darkcard bg-white border dark:border-darkborder border-lightborder rounded-2xl p-6 mb-8 flex items-center gap-5 shadow-xl dark:shadow-none"
      >
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold dark:text-darktext text-lighttext">{userName}'s Health Dashboard</h1>
          <p className="dark:text-darksub text-lightsub text-sm mt-0.5">
            BMI: <span className="dark:text-darktext text-lighttext font-semibold">{bmi}</span>
            {formData?.WHR > 0 && (
              <> &nbsp;&middot;&nbsp; WHtR: <span className="dark:text-darktext text-lighttext font-semibold">{formData.WHR}</span></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <FiCheckCircle size={16} />
          Assessment saved
        </div>
      </motion.div>

      {/* Risk Gauge Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <RiskCard label="Heart Disease Risk" risk={heartRisk} riskLabel={heartLabel} type="heart" factors={heartFactors} delay={0} />
        <RiskCard label="Diabetes Risk" risk={diabetesRisk} riskLabel={diabetesLabel} type="diabetes" factors={diabetesFactors} delay={0.1} />
        <RiskCard label="Obesity Risk" risk={obesityRisk} riskLabel={obesityLabel} type="obesity" factors={obesityFactors} delay={0.2} />
      </div>

      {compoundingAlert && (
        <CompoundingAlert show={compoundingAlert} message={compoundingMessage} />
      )}

      {/* Charts + Simulation */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <RiskChart diabetes={diabetesRisk} heart={heartRisk} obesity={obesityRisk} />
        <SimulationSlider formData={formData} originalResults={results} />
      </div>

      {/* Action Plan */}
      <ActionPlan actions={actionPlan} />
    </div>
  );
}
