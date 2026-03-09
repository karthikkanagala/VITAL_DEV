import emailjs from '@emailjs/browser';

const SERVICE   = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUB_KEY   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const GREETING  = import.meta.env.VITE_EMAILJS_GREETING_TEMPLATE;
const EMERGENCY = import.meta.env.VITE_EMAILJS_EMERGENCY_TEMPLATE;

// v4 syntax — passing an options object is required in @emailjs/browser v4+
emailjs.init({ publicKey: PUB_KEY });

// Welcome Email — new account created
export async function sendWelcomeEmail(user) {
  if (!user?.email) return;
  try {
    await emailjs.send(SERVICE, GREETING, {
      to_email: user.email,
      to_name: user.displayName || 'Health Warrior',
      email_subject: `Welcome to VitalScan, ${user.displayName || 'Health Warrior'}! 💚`,
      email_body:
        `Welcome to VitalScan! 🎉\n\nYou have taken the first step toward understanding your health before it becomes an emergency.\n\n💚 What VitalScan does for you:\n✅ Detects heart disease risk early\n✅ Identifies diabetes risk patterns\n✅ Flags obesity complications\n✅ Gives personalised action plan\n\nComplete your first health assessment.\nTakes less than 2 minutes.\nNo lab tests. No doctor visit. Free.`,
      extra_message:
        `Prevention is always easier than cure.\nYou now have the power to act before it is too late.`,
    });
    console.log('[EmailService] Welcome email sent to', user.email);
  } catch (err) {
    console.error('[EmailService] Failed to send welcome email:', err);
  }
}

// Welcome Back Email — user signs in again
export async function sendWelcomeBackEmail(user) {
  if (!user?.email) return;
  const time = new Date().toLocaleString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  try {
    await emailjs.send(SERVICE, GREETING, {
      to_email: user.email,
      to_name: user.displayName || 'Health Warrior',
      email_subject: `Welcome back, ${user.displayName || 'Health Warrior'}! 💚`,
      email_body:
        `Great to see you back! 👋\n\nYou signed in on: ${time}\n\nRun a new assessment today to track your health progress.`,
      extra_message: `Small habits. Big impact. Every day.`,
    });
    console.log('[EmailService] Welcome back email sent to', user.email);
  } catch (err) {
    console.error('[EmailService] Failed to send welcome back email:', err);
  }
}

// Emergency Alert — sent sequentially to each contact to avoid rate limits
export async function sendEmergencyAlert(user, results, contacts) {
  if (!user || !results || !contacts?.length) return;

  const highRisks = [];
  if (results.heartRisk >= 70)    highRisks.push(`Heart Disease: ${results.heartRisk}%`);
  if (results.diabetesRisk >= 70) highRisks.push(`Diabetes: ${results.diabetesRisk}%`);
  if (results.obesityRisk >= 70)  highRisks.push(`Obesity: ${results.obesityRisk}%`);

  const eligible = contacts.filter((m) => m.email?.trim());
  if (!eligible.length) return;

  for (const member of eligible) {
    try {
      await emailjs.send(SERVICE, EMERGENCY, {
        to_email:       member.email,
        family_name:    member.name || 'Family Member',
        patient_name:   user.displayName || 'Your family member',
        patient_email:  user.email || '',
        heart_risk:     results.heartRisk + '%',
        diabetes_risk:  results.diabetesRisk + '%',
        obesity_risk:   results.obesityRisk + '%',
        risk_summary:   highRisks.join(', '),
        alert_date:     new Date().toLocaleDateString('en-IN'),
        action_message: 'Please encourage them to consult a doctor immediately.',
      });
      console.log('[EmailService] Emergency alert sent to', member.email);
    } catch (err) {
      console.error('[EmailService] Failed to send emergency alert to', member.email, err);
    }
    // 1 s gap between sends to respect rate limits
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// Results Email — sent to the user after every assessment
export async function sendResultsEmail(user, results, actionPlan) {
  if (!user?.email) return;
  if (!results) return;

  try {
    const heart    = results.heartRisk    || 0;
    const diabetes = results.diabetesRisk || 0;
    const obesity  = results.obesityRisk  || 0;
    const maxRisk  = Math.max(heart, diabetes, obesity);

    const riskLabel = (score) =>
      score >= 70 ? 'HIGH RISK' : score >= 45 ? 'MODERATE' : 'LOW RISK';

    const overallLabel =
      maxRisk >= 70 ? 'HIGH RISK — Please see a doctor soon' :
      maxRisk >= 45 ? 'MODERATE RISK — Take action now'       :
                     'LOW RISK — Keep it up!';

    const actionText = Array.isArray(actionPlan) && actionPlan.length > 0
      ? actionPlan.slice(0, 3).map((a, i) => `${i + 1}. ${a}`).join('\n')
      : '1. Consult a healthcare provider\n2. Track your lifestyle habits\n3. Schedule a regular health checkup';

    const now = new Date();
    const reportId =
      'VS-' +
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      '-' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');

    const assessmentDate = now.toLocaleString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // All risk data is embedded directly inside email_body so it renders in any
    // template that uses {{email_body}} — no extra template variables needed.
    const emailBody =
      `Hello ${user.displayName || 'Health Warrior'},\n\n` +
      `Your VitalScan health risk assessment is complete.\n` +
      `Assessed on: ${assessmentDate}\n` +
      `Report ID:   ${reportId}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `          YOUR RISK SCORES\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Heart Disease Risk  : ${heart}%   (${riskLabel(heart)})\n` +
      `Diabetes Risk       : ${diabetes}%   (${riskLabel(diabetes)})\n` +
      `Obesity Risk        : ${obesity}%   (${riskLabel(obesity)})\n\n` +
      `Overall Assessment  : ${overallLabel}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `    YOUR PERSONALISED ACTION PLAN\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${actionText}`;

    const extraMessage =
      maxRisk >= 70
        ? 'One or more of your risk scores are HIGH. Please consult a doctor this week. Early action can prevent serious illness.\n\nThis is an automated email from VitalScan.'
        : maxRisk >= 45
        ? 'Some of your scores need attention. Small lifestyle changes made consistently will make a big difference.\n\nThis is an automated email from VitalScan.'
        : 'Your scores look good! Keep maintaining your healthy habits and run another check in 3 months.\n\nThis is an automated email from VitalScan.';

    const res = await emailjs.send(SERVICE, GREETING, {
      to_email:      user.email,
      to_name:       user.displayName || 'Health Warrior',
      email_subject: `Your VitalScan Results: ${overallLabel}`,
      email_body:    emailBody,
      extra_message: extraMessage,
    });

    console.log('[EmailService] Results email sent to', user.email, '| status:', res.status);
    return res;
  } catch (err) {
    console.error('[EmailService] Results email failed:', err?.text || err?.message || err);
    // Never throw — email failure must not block the results page
  }
}

// Diet Plan Email — sent after a personalised diet plan is generated
export async function sendDietPlanEmail(user, dietPlan, medications) {
  if (!user?.email) return;
  if (!dietPlan) return;

  try {
    const medList =
      !medications || medications.includes('none') ? 'None' : medications.join(', ');

    const foodsToEat = (dietPlan.foods_to_eat || [])
      .slice(0, 5)
      .map((f) => `✅ ${f}`)
      .join('\n');

    const foodsToAvoid = (dietPlan.foods_to_avoid || [])
      .slice(0, 5)
      .map((f) => `❌ ${f}`)
      .join('\n');

    const topActions = (dietPlan.priority_actions || [])
      .slice(0, 3)
      .map((a, i) => `${i + 1}. ${a}`)
      .join('\n');

    const lifestyleTips = (dietPlan.lifestyle_tips || [])
      .slice(0, 3)
      .join('\n');

    await emailjs.send(SERVICE, GREETING, {
      to_email:      user.email,
      to_name:       user.displayName || 'Health Warrior',
      email_subject: `Your VitalScan Diet Plan is Ready`,
      email_body:
        `Your personalised diet plan has been\n` +
        `generated based on your risk profile.\n\n` +
        `Current Medications: ${medList}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `FOODS TO PRIORITIZE:\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `${foodsToEat}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `FOODS TO AVOID:\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `${foodsToAvoid}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `TOP PRIORITY ACTIONS:\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `${topActions}`,
      extra_message:
        `Lifestyle Tips:\n${lifestyleTips}\n\n` +
        `For best results, follow this plan consistently for 4-6 weeks.\n\n` +
        `This is an automated email from VitalScan.`,
    });
    console.log('[EmailService] Diet plan email sent ✅');
  } catch (err) {
    console.error('[EmailService] Diet plan email failed:', err);
  }
}

