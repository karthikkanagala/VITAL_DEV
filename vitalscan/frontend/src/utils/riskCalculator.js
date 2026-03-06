export function calculateBMI(heightCm, weightKg) {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getRiskLevel(value) {
  if (value >= 70) return { level: 'HIGH', color: 'red' };
  if (value >= 40) return { level: 'MODERATE', color: 'yellow' };
  return { level: 'LOW', color: 'green' };
}

export function getOverallRisk(diabetes, heart, stroke) {
  const max = Math.max(diabetes, heart, stroke);
  const avg = (diabetes + heart + stroke) / 3;
  return Math.round((max * 0.6 + avg * 0.4) * 10) / 10;
}
