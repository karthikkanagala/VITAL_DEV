import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import useTheme from '../../hooks/useTheme';

const avgIndian = { heart: 32, diabetes: 28, obesity: 35 };

export default function RiskChart({ diabetes, heart, obesity }) {
  const { isDark } = useTheme();

  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const tickColor = isDark ? '#6B7B6E' : '#4B6B52';
  const tooltipBg = isDark ? '#0F1610' : '#FFFFFF';
  const tooltipBorder = isDark ? '#1A2A1E' : '#D1FAE5';

  const radarData = [
    { metric: 'Diabetes', value: diabetes },
    { metric: 'Heart', value: heart },
    { metric: 'Obesity', value: obesity },
  ];

  const barData = [
    { name: 'Heart', yours: heart, avg: avgIndian.heart },
    { name: 'Diabetes', yours: diabetes, avg: avgIndian.diabetes },
    { name: 'Obesity', yours: obesity, avg: avgIndian.obesity },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="dark:bg-darkcard bg-white rounded-2xl p-6 border dark:border-darkborder border-lightborder shadow-xl dark:shadow-none"
    >
      <h3 className="text-lg font-semibold dark:text-darktext text-lighttext mb-4">Risk Visualization</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs dark:text-darksub text-lightsub mb-2 text-center">Radar View</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: tickColor, fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#00DC78" fill="#00DC78" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-xs dark:text-darksub text-lightsub mb-2 text-center">Your risk vs Average Indian adult</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: tickColor, fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: tickColor, fontSize: 10 }} width={65} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8 }}
                labelStyle={{ color: isDark ? '#F1F5F2' : '#0F1F14' }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="yours" name="You" fill="#00DC78" radius={[0, 4, 4, 0]} />
              <Bar dataKey="avg" name="Avg Indian" fill="#11C4D4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
