const Field = ({ label, value, onChange, min, max, step, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
      required
    />
    {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
    <span className="text-sm text-gray-300">{label}</span>
    <button
      type="button"
      onClick={() => onChange(value === '1' ? '0' : '1')}
      className={`w-12 h-6 rounded-full transition-colors relative ${
        value === '1' ? 'bg-primary-600' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          value === '1' ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

export default function FormStep3({ form, update }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-1">Medical History</h3>
      <p className="text-gray-500 text-sm mb-6">Blood markers and family history</p>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Total Cholesterol" value={form.cholesterol_total} onChange={(v) => update('cholesterol_total', v)} min={50} max={500} hint="mg/dL" />
        <Field label="HDL Cholesterol" value={form.hdl} onChange={(v) => update('hdl', v)} min={10} max={150} hint="mg/dL (good cholesterol)" />
        <Field label="LDL Cholesterol" value={form.ldl} onChange={(v) => update('ldl', v)} min={20} max={400} hint="mg/dL (bad cholesterol)" />
        <Field label="Triglycerides" value={form.triglycerides} onChange={(v) => update('triglycerides', v)} min={30} max={1000} hint="mg/dL" />
        <Field label="Fasting Blood Glucose" value={form.blood_glucose} onChange={(v) => update('blood_glucose', v)} min={30} max={600} hint="mg/dL" />
        <Field label="HbA1c" value={form.hba1c} onChange={(v) => update('hba1c', v)} min={3} max={15} step={0.1} hint="% (3-month avg blood sugar)" />
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Family History</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          <Toggle label="Diabetes" value={form.family_diabetes} onChange={(v) => update('family_diabetes', v)} />
          <Toggle label="Heart Disease" value={form.family_heart} onChange={(v) => update('family_heart', v)} />
          <Toggle label="Stroke" value={form.family_stroke} onChange={(v) => update('family_stroke', v)} />
        </div>
      </div>
    </div>
  );
}
