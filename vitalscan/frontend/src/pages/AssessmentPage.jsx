import AssessmentForm from '../components/form/AssessmentForm';

export default function AssessmentPage() {
  return (
    <section className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold gradient-text mb-3">Health Assessment</h1>
          <p className="dark:text-darksub text-lightsub max-w-xl mx-auto">
            Complete this 3-step assessment to receive your personalized health risk analysis.
            All data is processed securely and never shared.
          </p>
        </div>
        <AssessmentForm />
      </div>
    </section>
  );
}
