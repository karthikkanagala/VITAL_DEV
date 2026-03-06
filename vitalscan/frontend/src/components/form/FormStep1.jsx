const Field = ({ label, type = 'number', value, onChange, min, max, step, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <input
      type={type}
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

export default function FormStep1({ form, update }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-1">Personal Details</h3>
      <p className="text-gray-500 text-sm mb-6">Basic demographic and body measurements</p>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Age" value={form.age} onChange={(v) => update('age', v)} min={1} max={120} hint="Years" />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
          >
            <option value="0">Male</option>
            <option value="1">Female</option>
          </select>
        </div>
        <Field label="Height" value={form.height_cm} onChange={(v) => update('height_cm', v)} min={50} max={300} hint="cm" />
        <Field label="Weight" value={form.weight_kg} onChange={(v) => update('weight_kg', v)} min={20} max={500} hint="kg" />
        <Field label="Systolic BP" value={form.systolic_bp} onChange={(v) => update('systolic_bp', v)} min={60} max={300} hint="mmHg (top number)" />
        <Field label="Diastolic BP" value={form.diastolic_bp} onChange={(v) => update('diastolic_bp', v)} min={30} max={200} hint="mmHg (bottom number)" />
      </div>
    </div>
  );
}
