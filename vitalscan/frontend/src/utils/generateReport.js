import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function riskColor(score) {
  if (score < 45) return '#22c55e';
  if (score < 70) return '#f97316';
  return '#ef4444';
}

function factorsHtml(factors) {
  if (!factors || factors.length === 0) return '';
  return factors
    .map(
      (f) =>
        `<p style="font-size:10px;color:#94a3b8;display:flex;align-items:center;gap:4px;margin:0 0 2px 0;">` +
        `<span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:#94a3b8;flex-shrink:0;"></span>${f}</p>`
    )
    .join('');
}

function actionPlanHtml(actions) {
  if (!actions || actions.length === 0) {
    return '<p style="font-size:13px;color:#64748b;padding:8px;">Maintain current healthy lifestyle and schedule regular check-ups.</p>';
  }
  return actions
    .slice(0, 5)
    .map((a, i) => {
      const text = typeof a === 'string' ? a : a.action || String(a);
      return (
        `<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 12px;border-radius:8px;` +
        `background:#11c4d408;margin-bottom:6px;border-left:3px solid #11c4d4;">` +
        `<span style="font-size:18px;font-weight:900;color:#11c4d4;line-height:1;flex-shrink:0;min-width:20px;">${i + 1}</span>` +
        `<p style="font-size:13px;color:#334155;line-height:1.4;margin:0;">${text}</p></div>`
      );
    })
    .join('');
}

export async function generateVitalScanReport(results, user, inputs) {
  const response = await fetch('/reportTemplate.html');
  let html = await response.text();

  const bmi = parseFloat(inputs.BMI || 0).toFixed(1);
  const bmiCat =
    bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

  const whr = parseFloat(inputs.WHR || 0).toFixed(2);
  const whrCat =
    whr < 0.4 ? 'Very Low' : whr < 0.5 ? 'Healthy' : whr < 0.6 ? 'Elevated' : 'High Risk';

  const activityMap = ['Sedentary', 'Light Activity', '3-4 times/week', 'Very Active'];
  const stressMap = ['Low', 'Moderate', 'High'];
  const smokingMap = ['Non-smoker', 'Former Smoker', 'Current Smoker'];
  const chestMap = ['Never', 'Sometimes', 'Often'];
  const thirstMap = ['No', 'Sometimes', 'Yes'];

  const dietWidths = { 0: '15%', 1: '50%', 2: '85%' };
  const dietLabels = { 0: 'Low', 1: 'Moderate', 2: 'High' };
  const waterWidths = { 0: '15%', 1: '40%', 2: '70%', 3: '95%' };
  const waterLabels = { 0: '<1L/day', 1: '1-2L/day', 2: '3-4L/day', 3: '>4L/day' };
  const stressColorStyles = ['color:#22c55e', 'color:#f97316', 'color:#ef4444'];

  const heartColor = riskColor(results.heartRisk);
  const diabetesColor = riskColor(results.diabetesRisk);
  const obesityColor = riskColor(results.obesityRisk);

  function riskBg(color) {
    if (color === '#22c55e') return '#f0fdf4';
    if (color === '#f97316') return '#fff7ed';
    return '#fef2f2';
  }
  const heartBg = riskBg(heartColor);
  const diabetesBg = riskBg(diabetesColor);
  const obesityBg = riskBg(obesityColor);

  const reportId =
    '#' + Math.floor(1000 + Math.random() * 9000) + '-VS-' + new Date().getFullYear();
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const year = new Date().getFullYear();

  const overallScore = Math.round(
    100 - (results.heartRisk + results.diabetesRisk + results.obesityRisk) / 3
  );

  const heartLabel =
    results.heartLabel ||
    (results.heartRisk < 45 ? 'Low Risk' : results.heartRisk < 70 ? 'Moderate' : 'High Risk');
  const diabetesLabel =
    results.diabetesLabel ||
    (results.diabetesRisk < 45 ? 'Low Risk' : results.diabetesRisk < 70 ? 'Moderate' : 'High Risk');
  const obesityLabel =
    results.obesityLabel ||
    (results.obesityRisk < 45 ? 'Low Risk' : results.obesityRisk < 70 ? 'Moderate' : 'High Risk');

  const summaryText =
    `Based on your clinical metrics and lifestyle profile, your overall metabolic health score is ` +
    `<span style="color:white;font-weight:700">${overallScore}/100</span>. ` +
    `Heart Disease: <span style="color:${heartColor};font-weight:600">${results.heartRisk}% - ${heartLabel}</span>. ` +
    `Diabetes: <span style="color:${diabetesColor};font-weight:600">${results.diabetesRisk}% - ${diabetesLabel}</span>. ` +
    `Obesity: <span style="color:${obesityColor};font-weight:600">${results.obesityRisk}% - ${obesityLabel}</span>.` +
    (results.compoundingAlert
      ? ` &#9888; ${results.compoundingMessage || 'Multiple elevated risk factors detected.'}`
      : '');

  const familyHeartHtml =
    inputs.family_history_heart === 1
      ? '<span style="font-weight:600;color:#ef4444">Yes</span>'
      : '<span style="font-weight:600">No</span>';

  const tokens = {
    '{{REPORT_ID}}': reportId,
    '{{REPORT_DATE}}': today,
    '{{REPORT_YEAR}}': String(year),
    '{{AGE}}': String(inputs.age ?? ''),
    '{{SEX}}': inputs.sex === 1 ? 'Male' : 'Female',
    '{{HEIGHT}}': String(inputs.height_cm ?? ''),
    '{{WEIGHT}}': String(inputs.weight_kg ?? ''),
    '{{WAIST}}': String(inputs.waist_cm ?? ''),
    '{{BMI_VALUE}}': bmi,
    '{{BMI_CATEGORY}}': bmiCat,
    '{{WHR_VALUE}}': whr,
    '{{WHR_CATEGORY}}': whrCat,
    '{{FAMILY_HEART_HTML}}': familyHeartHtml,
    '{{FAMILY_DIAB}}': inputs.family_history_diab === 1 ? 'Yes' : 'No',
    '{{CHEST_DISCOMFORT}}': chestMap[inputs.chest_discomfort] ?? 'N/A',
    '{{EXCESSIVE_THIRST}}': thirstMap[inputs.excessive_thirst] ?? 'N/A',
    '{{ACTIVITY_LABEL}}': activityMap[inputs.physical_activity] ?? 'N/A',
    '{{SLEEP_HOURS}}': String(inputs.sleep_hours ?? ''),
    '{{STRESS_LABEL}}': stressMap[inputs.stress_level] ?? 'N/A',
    '{{STRESS_COLOR_STYLE}}': stressColorStyles[inputs.stress_level] ?? '',
    '{{SMOKING_LABEL}}': smokingMap[inputs.smoking_status] ?? 'N/A',
    '{{FRIED_BAR_WIDTH}}': dietWidths[inputs.fried_food] ?? '15%',
    '{{FRIED_LABEL}}': dietLabels[inputs.fried_food] ?? 'Low',
    '{{SALT_BAR_WIDTH}}': dietWidths[inputs.salt_intake] ?? '15%',
    '{{SALT_LABEL}}': dietLabels[inputs.salt_intake] ?? 'Low',
    '{{SUGAR_BAR_WIDTH}}': dietWidths[inputs.sugar_intake] ?? '15%',
    '{{SUGAR_LABEL}}': dietLabels[inputs.sugar_intake] ?? 'Low',
    '{{WATER_BAR_WIDTH}}': waterWidths[inputs.water_intake] ?? '40%',
    '{{WATER_LABEL}}': waterLabels[inputs.water_intake] ?? '1-2L/day',
    '{{HEART_RISK}}': String(results.heartRisk),
    '{{HEART_LABEL}}': heartLabel,
    '{{HEART_COLOR}}': heartColor,
    '{{HEART_BG}}': heartBg,
    '{{HEART_FACTORS_HTML}}': factorsHtml(results.heartFactors),
    '{{DIABETES_RISK}}': String(results.diabetesRisk),
    '{{DIABETES_LABEL}}': diabetesLabel,
    '{{DIABETES_COLOR}}': diabetesColor,
    '{{DIABETES_BG}}': diabetesBg,
    '{{DIABETES_FACTORS_HTML}}': factorsHtml(results.diabetesFactors),
    '{{OBESITY_RISK}}': String(results.obesityRisk),
    '{{OBESITY_LABEL}}': obesityLabel,
    '{{OBESITY_COLOR}}': obesityColor,
    '{{OBESITY_BG}}': obesityBg,
    '{{OBESITY_FACTORS_HTML}}': factorsHtml(results.obesityFactors),
    '{{ACTION_PLAN_HTML}}': actionPlanHtml(results.actionPlan),
    '{{SUMMARY_TEXT}}': summaryText,
  };

  for (const [token, value] of Object.entries(tokens)) {
    html = html.split(token).join(String(value ?? ''));
  }

  // Render via iframe so the full HTML document (including Tailwind CDN <script>) executes.
  // div.innerHTML silently drops <script> tags — iframe does not.
  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:794px;height:1200px;border:none;pointer-events:none;';
  document.body.appendChild(iframe);

  await new Promise((resolve) => {
    iframe.onload = () => setTimeout(resolve, 800); // wait for Google Fonts only (no CDN Tailwind)
    setTimeout(resolve, 3000); // hard fallback
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
  });

  // Expand to full content height before screenshotting
  const contentHeight = iframe.contentDocument.documentElement.scrollHeight;
  iframe.style.height = contentHeight + 'px';
  await new Promise((resolve) => setTimeout(resolve, 150));

  const canvas = await html2canvas(iframe.contentDocument.body, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    width: 794,
    windowWidth: 794,
    height: contentHeight,
    scrollX: 0,
    scrollY: 0,
  });

  document.body.removeChild(iframe);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const pxPerMm = canvas.width / pdfW;
  const pageHeightPx = pdfH * pxPerMm;

  if (canvas.height <= pageHeightPx) {
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, (canvas.height / canvas.width) * pdfW);
  } else {
    let yOffset = 0;
    while (yOffset < canvas.height) {
      if (yOffset > 0) pdf.addPage();
      const sliceH = Math.min(pageHeightPx, canvas.height - yOffset);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      sliceCanvas
        .getContext('2d')
        .drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, sliceH / pxPerMm);
      yOffset += pageHeightPx;
    }
  }

  const safeName = (inputs?.name || user?.fullName || 'User').replace(/\s+/g, '_');
  const fileId = Math.floor(1000 + Math.random() * 9000) + '-VS-' + year;
  const fileName = `VitalScan_Report_${safeName}_${fileId}.pdf`;
  pdf.save(fileName);
  return fileName;
}
