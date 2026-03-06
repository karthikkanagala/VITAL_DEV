export default function FormStep2({ form, update }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-1">Lifestyle Factors</h3>
      <p className="text-gray-500 text-sm mb-6">Habits and activity levels</p>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Smoking Status</label>
          <select
            value={form.smoking}
            onChange={(e) => update('smoking', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
          >
            <option value="0">Non-smoker</option>
            <option value="1">Smoker</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Alcohol (drinks/week)</label>
          <input
            type="number"
            value={form.alcohol_weekly}
            onChange={(e) => update('alcohol_weekly', e.target.value)}
            min={0}
            max={50}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
            required
          />
          <p className="text-xs text-gray-600 mt-1">Standard drinks per week</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Exercise (hours/week)</label>
          <input
            type="number"
            value={form.exercise_hours_weekly}
            onChange={(e) => update('exercise_hours_weekly', e.target.value)}
            min={0}
            max={40}
            step={0.5}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
            required
          />
          <p className="text-xs text-gray-600 mt-1">Hours of moderate-vigorous activity</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Stress Level: <span className="text-primary-400 font-bold">{form.stress_level}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={form.stress_level}
            onChange={(e) => update('stress_level', e.target.value)}
            className="w-full accent-primary-500 mt-2"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
