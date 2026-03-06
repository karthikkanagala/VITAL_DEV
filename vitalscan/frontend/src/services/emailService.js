import emailjs from '@emailjs/browser';

const SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUB_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const GREETING = import.meta.env.VITE_EMAILJS_GREETING_TEMPLATE;
const EMERGENCY = import.meta.env.VITE_EMAILJS_EMERGENCY_TEMPLATE;

emailjs.init(PUB_KEY);

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

