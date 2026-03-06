import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t dark:border-darkborder border-lightborder dark:bg-[#050705] bg-lightbg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-sm bg-neon-500" />
              <span className="text-lg font-bold dark:text-darktext text-lighttext">VITAL</span>
              <span className="text-lg font-bold text-neon-500 -ml-1.5">SCAN</span>
            </div>
            <p className="dark:text-darksub text-lightsub text-sm leading-relaxed">
              AI-powered health risk prediction for diabetes, heart disease, and stroke.
              Not a substitute for professional medical advice.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold dark:text-darktext text-lighttext mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="dark:text-darksub text-lightsub hover:text-neon-500 text-sm transition-colors">Home</Link>
              <Link to="/assessment" className="dark:text-darksub text-lightsub hover:text-neon-500 text-sm transition-colors">Assessment</Link>
              <Link to="/about" className="dark:text-darksub text-lightsub hover:text-neon-500 text-sm transition-colors">About</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold dark:text-darktext text-lighttext mb-3">Disclaimer</h4>
            <p className="dark:text-darksub text-lightsub text-sm leading-relaxed">
              VitalScan is an educational tool. Predictions are based on statistical models
              and should not replace professional medical diagnosis.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t dark:border-darkborder border-lightborder flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="dark:text-darksub text-lightsub text-xs">
            &copy; 2026 VitalScan &middot; APEXRush &middot; Ram Karthik Kanagala
          </p>
          <p className="dark:text-darksub text-lightsub text-xs">
            Educational use only &middot; Not a medical diagnosis
          </p>
        </div>
      </div>
    </footer>
  );
}
