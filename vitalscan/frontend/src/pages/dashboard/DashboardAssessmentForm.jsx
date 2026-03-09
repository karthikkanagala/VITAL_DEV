import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiUser, FiActivity, FiCoffee, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import useRiskPrediction from '../../hooks/useRiskPrediction';
import {
  getUserProfile,
  getUserAssessments,
  saveAssessment,
  updateUserProfile,
  getEmergencyContacts,
} from '../../services/firestoreService';
import { sendEmergencyAlert, sendResultsEmail } from '../../services/emailService';
import { validateForm } from '../../utils/validateForm';

/* ── Shared Tailwind input class ── */
const inputCls =
  'w-full dark:bg-darkcard bg-white border dark:border-darkborder border-lightborder rounded-lg px-4 py-2.5 dark:text-white text-darkbg text-sm focus:outline-none focus:border-neon-500 transition-colors';

/* ── Auto-fill badge helpers ── */
function badgeStyle(type) {
  if (type === 'profile') return { background: '#0d2010', color: '#00DC78', border: '1px solid #00DC78' };
  if (type === 'last') return { background: '#0d1a2e', color: '#38bdf8', border: '1px solid #38bdf8' };
  return { background: '#2a1a00', color: '#f97316', border: '1px solid #f97316' };
}

function badgeIcon(type) {
  if (type === 'profile') return '👤 Profile';
  if (type === 'last') return '📊 Last assessment';
  return '✏️ Please fill';
}

/* ── Field wrapper with optional auto-fill badge ── */
function FieldWrapper({ label, badge, error, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="block text-sm font-medium dark:text-darktext text-lighttext">{label}</label>
        {badge && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={badgeStyle(badge)}
          >
            {badgeIcon(badge)}
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">&#9888; {error}</p>}
    </div>
  );
}

/* ── Field Components ── */
function NumField({ label, value, onChange, hint, min, max, step = 1, badge, error }) {
  return (
    <FieldWrapper label={label} badge={badge} error={error}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder={hint}
        className={inputCls + (error ? ' !border-red-500' : '')}
        required
      />
    </FieldWrapper>
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-1">{label}</label>
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}

function PillToggle({ label, value, onChange, options, badge }) {
  return (
    <FieldWrapper label={label} badge={badge}>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 text-sm font-medium px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              value === o.value
                ? 'bg-primary text-darkbg border-primary'
                : 'dark:bg-darkcard dark:border-darkborder dark:text-white bg-white border-lightborder text-darkbg hover:border-primary/40'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </FieldWrapper>
  );
}

function PillCards({ label, value, onChange, options, colorMap, badge }) {
  return (
    <FieldWrapper label={label} badge={badge}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const isActive = value === o.value;
          const color = colorMap?.[o.value];
          let activeCls = 'bg-primary text-darkbg border-primary';
          if (color === 'green') activeCls = 'bg-green-500 text-white border-green-500';
          if (color === 'amber') activeCls = 'bg-amber-500 text-white border-amber-500';
          if (color === 'red') activeCls = 'bg-red-500 text-white border-red-500';
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`text-sm font-medium px-4 py-2 rounded-lg border transition-all duration-200 ${
                isActive
                  ? activeCls
                  : 'dark:bg-darkcard dark:border-darkborder dark:text-white bg-white border-lightborder text-darkbg hover:border-primary/40'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </FieldWrapper>
  );
}

function SelectField({ label, value, onChange, options, badge }) {
  return (
    <FieldWrapper label={label} badge={badge}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldWrapper>
  );
}

function YesNoToggle({ label, value, onChange, badge }) {
  const isYes = value === '1';
  return (
    <div className="flex items-center justify-between dark:bg-darkcard bg-white border dark:border-darkborder border-lightborder rounded-lg px-4 py-3">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm dark:text-darktext text-lighttext">{label}</span>
        {badge && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={badgeStyle(badge)}
          >
            {badge === 'profile' ? '👤' : badge === 'last' ? '📊' : '✏️'}
          </span>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange('0')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !isYes
              ? 'bg-green-500/20 text-green-400 border-green-500/40'
              : 'dark:bg-darkcard bg-white dark:border-darkborder border-lightborder dark:text-darksub text-lightsub'
          }`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => onChange('1')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            isYes
              ? 'bg-red-500/20 text-red-400 border-red-500/40'
              : 'dark:bg-darkcard bg-white dark:border-darkborder border-lightborder dark:text-darksub text-lightsub'
          }`}
        >
          Yes
        </button>
      </div>
    </div>
  );
}

/* ── BMI / WHtR badge helpers ── */
function bmiBadge(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', cls: 'text-cyan-400 bg-cyan-500/20' };
  if (bmi < 25) return { label: 'Normal', cls: 'text-green-400 bg-green-500/20' };
  if (bmi < 30) return { label: 'Overweight', cls: 'text-amber-400 bg-amber-500/20' };
  return { label: 'Obese', cls: 'text-red-400 bg-red-500/20' };
}

function whtrBadge(whtr) {
  if (whtr <= 0.5) return { label: 'Healthy', cls: 'text-green-400 bg-green-500/20' };
  if (whtr <= 0.6) return { label: 'Overweight', cls: 'text-amber-400 bg-amber-500/20' };
  return { label: 'High Risk', cls: 'text-red-400 bg-red-500/20' };
}

function calcSleepHours(bedtime, wakeup) {
  if (!bedtime || !wakeup) return 0;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeup.split(':').map(Number);
  let diff = (wh * 60 + wm) - (bh * 60 + bm);
  if (diff <= 0) diff += 1440;
  return Math.round((diff / 60) * 10) / 10;
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-primary/30">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="text-primary" size={18} />
      </div>
      <h3 className="text-lg font-semibold dark:text-darktext text-lighttext">{title}</h3>
    </div>
  );
}

/* ── Constants ── */
const defaultData = {
  age: '',
  gender: 'Male',
  height_cm: '',
  weight_kg: '',
  waist_cm: '',
  physical_activity: '0',
  bedtime: '23:00',
  wakeup_time: '07:00',
  stress_level: '1',
  smoking: '0',
  fried_food: '0',
  sugar_intake: '0',
  salt_intake: '0',
  water_intake: '1',
  family_heart: '0',
  family_diabetes: '0',
  chest_discomfort: '0',
  excessive_thirst: '0',
};

const stepLabels = ['Personal Details', 'Body Vitals & Lifestyle', 'Diet & Medical History'];

const cardCls =
  'dark:bg-darkcard bg-white border dark:border-darkborder border-lightborder rounded-2xl p-6 shadow-xl dark:shadow-none';

function LoadingPulse() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function DashboardAssessmentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dispatch } = useAppContext();
  const { predict, loading } = useRiskPrediction();

  const [form, setForm] = useState(defaultData);
  const [step, setStep] = useState(0);
  const [autoBadges, setAutoBadges] = useState({});
  const [autoSummary, setAutoSummary] = useState({ fromProfile: 0, fromLast: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const alertRef = useRef(false);

  /* ── Auto-fill on mount ── */
  useEffect(() => {
    if (!user) return;
    Promise.all([
      getUserProfile(user.uid),
      getUserAssessments(user.uid),
    ]).then(([profile, assessments]) => {
      const last = assessments?.[0];
      const updates = {};
      const badges = {};
      let fromProfile = 0;
      let fromLast = 0;

      // From profile
      if (profile) {
        if (profile.age) {
          updates.age = String(profile.age);
          badges.age = 'profile';
          fromProfile++;
        }
        if (profile.sex !== undefined && profile.sex !== null && profile.sex !== '') {
          // sex can be stored as 0/1 integer or 'Male'/'Female' string
          const sexNum = Number(profile.sex);
          updates.gender = sexNum === 1 ? 'Male' : sexNum === 0 ? 'Female' : String(profile.sex);
          if (updates.gender !== 'Male' && updates.gender !== 'Female') updates.gender = 'Male';
          badges.gender = 'profile';
          fromProfile++;
        }
        if (profile.height_cm) {
          updates.height_cm = String(profile.height_cm);
          badges.height_cm = 'profile';
          fromProfile++;
        }
        if (profile.weight_kg) {
          updates.weight_kg = String(profile.weight_kg);
          badges.weight_kg = 'profile';
          fromProfile++;
        }
      }

      // From last assessment inputs
      if (last?.inputs) {
        const inp = last.inputs;
        if (inp.waist_cm) {
          updates.waist_cm = String(inp.waist_cm);
          badges.waist_cm = 'last';
          fromLast++;
        }
        if (inp.physical_activity !== undefined) {
          updates.physical_activity = String(inp.physical_activity);
          badges.physical_activity = 'last';
          fromLast++;
        }
        if (inp.stress_level !== undefined) {
          updates.stress_level = String(inp.stress_level);
          badges.stress_level = 'last';
          fromLast++;
        }
        if (inp.smoking_status !== undefined) {
          updates.smoking = String(inp.smoking_status);
          badges.smoking = 'last';
          fromLast++;
        }
        if (inp.family_history_heart !== undefined) {
          updates.family_heart = String(inp.family_history_heart);
          badges.family_heart = 'last';
          fromLast++;
        }
        if (inp.family_history_diab !== undefined) {
          updates.family_diabetes = String(inp.family_history_diab);
          badges.family_diabetes = 'last';
          fromLast++;
        }
        if (inp.water_intake !== undefined) {
          updates.water_intake = String(inp.water_intake);
          badges.water_intake = 'last';
          fromLast++;
        }
      }

      // Mark always-fresh fields
      ['fried_food', 'salt_intake', 'sugar_intake', 'chest_discomfort', 'excessive_thirst'].forEach((f) => {
        if (!badges[f]) badges[f] = 'fresh';
      });

      setForm((prev) => ({ ...prev, ...updates }));
      setAutoBadges(badges);
      setAutoSummary({ fromProfile, fromLast });
      setInitLoading(false);
    });
  }, [user]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const bmi = useMemo(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    if (!h || !w || h <= 0) return null;
    return Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
  }, [form.height_cm, form.weight_kg]);

  const whtr = useMemo(() => {
    const waist = parseFloat(form.waist_cm);
    const h = parseFloat(form.height_cm);
    if (!waist || !h || h <= 0) return null;
    return Math.round((waist / h) * 100) / 100;
  }, [form.waist_cm, form.height_cm]);

  const sleepHours = useMemo(
    () => calcSleepHours(form.bedtime, form.wakeup_time),
    [form.bedtime, form.wakeup_time]
  );

  const formPayload = useMemo(() => ({
    age: form.age,
    sex: form.gender === 'Male' ? 1 : 0,
    height_cm: form.height_cm,
    weight_kg: form.weight_kg,
    waist_cm: form.waist_cm,
    physical_activity: form.physical_activity,
    sleep_hours: sleepHours > 0 ? sleepHours : '',
    stress_level: form.stress_level,
    smoking_status: form.smoking,
    fried_food: form.fried_food,
    sugar_intake: form.sugar_intake,
    salt_intake: form.salt_intake,
    water_intake: form.water_intake,
    family_history_heart: form.family_heart,
    family_history_diab: form.family_diabetes,
    chest_discomfort: form.chest_discomfort,
    excessive_thirst: form.excessive_thirst,
  }), [form, sleepHours]);

  /* ── Submit ── */
  const submit = async () => {
    const { isValid, errors } = validateForm(formPayload);
    if (!isValid) {
      setFormErrors(errors);
      if (errors.age) setStep(0);
      else setStep(1);
      return;
    }
    setFormErrors({});
    setSubmitting(true);
    try {
      const h = Number(form.height_cm);
      const w = Number(form.weight_kg);
      const waist = Number(form.waist_cm) || 80;
      const bmiVal = h > 0 ? Math.round((w / Math.pow(h / 100, 2)) * 10) / 10 : 0;
      const whrVal = h > 0 ? Math.round((waist / h) * 100) / 100 : 0;

      const payload = {
        age: Number(form.age),
        sex: form.gender === 'Male' ? 1 : 0,
        height_cm: h,
        weight_kg: w,
        waist_cm: waist,
        BMI: bmiVal,
        WHR: whrVal,
        physical_activity: Number(form.physical_activity),
        sleep_hours: sleepHours,
        stress_level: Number(form.stress_level),
        family_history_heart: Number(form.family_heart),
        family_history_diab: Number(form.family_diabetes),
        smoking_status: Number(form.smoking),
        fried_food: Number(form.fried_food),
        chest_discomfort: Number(form.chest_discomfort),
        salt_intake: Number(form.salt_intake),
        sugar_intake: Number(form.sugar_intake),
        water_intake: Number(form.water_intake),
        excessive_thirst: Number(form.excessive_thirst),
        name: user?.displayName || 'User',
      };

      const results = await predict(payload);
      if (!results) {
        setSubmitting(false);
        return;
      }

      // Save assessment to Firestore
      saveAssessment(user.uid, {
        heartRisk: results.heartRisk,
        diabetesRisk: results.diabetesRisk,
        obesityRisk: results.obesityRisk,
        inputs: payload,
      }).catch(() => {});

      // Update profile with latest vitals
      updateUserProfile(user.uid, {
        age: Number(form.age),
        sex: form.gender === 'Male' ? 1 : 0,
        height_cm: h,
        weight_kg: w,
      }).catch(() => {});

      // Emergency alert if any risk >= 70
      const needsAlert =
        results.heartRisk >= 70 || results.diabetesRisk >= 70 || results.obesityRisk >= 70;
      if (needsAlert && !alertRef.current) {
        alertRef.current = true;
        getEmergencyContacts(user.uid).then((contacts) => {
          const eligible = (contacts || []).filter((c) => c.email?.trim());
          if (eligible.length > 0) {
            sendEmergencyAlert(user, results, eligible).catch(() => {});
          }
        });
      }

      // Send results email (fire-and-forget)
      sendResultsEmail(user, results, results.actionPlan).catch(() => {});

      // Sync to AppContext for compatibility with other components
      dispatch({ type: 'SET_FORM_DATA', payload });
      dispatch({ type: 'SET_RESULTS', payload: results });

      // Hand results to dashboard results view via router state
      navigate('/dashboard/results', { state: { results, inputs: payload } });
    } catch (err) {
      console.error('[DashboardAssessmentForm] Submit failed:', err);
      setSubmitting(false);
    }
  };

  /* ── Loading states ── */
  if (initLoading) return <LoadingPulse />;

  if (loading || submitting) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium dark:text-darksub text-lightsub">
            {submitting ? 'Analyzing your health data…' : 'Loading…'}
          </p>
        </div>
      </div>
    );
  }

  /* ── Option sets ── */
  const activityOpts = [
    { value: '0', label: 'Sedentary' },
    { value: '1', label: 'Light' },
    { value: '2', label: 'Moderate' },
    { value: '3', label: 'Active' },
  ];
  const stressMap = { '0': 'green', '1': 'amber', '2': 'red' };
  const stressOpts = [
    { value: '0', label: 'Low' },
    { value: '1', label: 'Moderate' },
    { value: '2', label: 'High' },
  ];
  const smokingOpts = [
    { value: '0', label: 'Never' },
    { value: '1', label: 'Former' },
    { value: '2', label: 'Current' },
  ];
  const levelOpts = [
    { value: '0', label: 'Low' },
    { value: '1', label: 'Moderate' },
    { value: '2', label: 'High' },
  ];
  const waterOpts = [
    { value: '0', label: '< 1L' },
    { value: '1', label: '1–2L' },
    { value: '2', label: '3–4L' },
    { value: '3', label: '> 4L' },
  ];
  const discomfortOpts = [
    { value: '0', label: 'Never' },
    { value: '1', label: 'Sometimes' },
    { value: '2', label: 'Often' },
  ];

  const progress = ((step + 1) / stepLabels.length) * 100;
  const totalAutoFill = autoSummary.fromProfile + autoSummary.fromLast;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-neon-500 text-sm mb-5 hover:opacity-80 transition-opacity"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <FiArrowLeft size={15} />
        Back to Dashboard
      </button>

      {/* Auto-fill summary banner */}
      {totalAutoFill > 0 && (
        <div
          className="rounded-xl px-5 py-3 mb-6 flex items-start gap-3"
          style={{ background: '#0d2010', border: '1px solid #00DC78' }}
        >
          <span className="text-xl shrink-0">✨</span>
          <div>
            <p className="text-sm font-semibold text-green-400">
              {totalAutoFill} fields auto-filled for you
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#4a6a4e' }}>
              {autoSummary.fromProfile > 0 && `${autoSummary.fromProfile} from your profile`}
              {autoSummary.fromProfile > 0 && autoSummary.fromLast > 0 && ' · '}
              {autoSummary.fromLast > 0 && `${autoSummary.fromLast} from your last assessment`}
              . Review and edit any field before submitting.
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium dark:text-darktext text-lighttext">
            Step {step + 1} of {stepLabels.length} — {stepLabels[step]}
          </span>
          <span className="text-xs dark:text-darksub text-lightsub">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full dark:bg-darkborder bg-lightborder overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {/* ══════ STEP 1: Personal Details ══════ */}
          {step === 0 && (
            <div className={cardCls}>
              <SectionHeader icon={FiUser} title="Personal Details" />
              <div className="grid sm:grid-cols-2 gap-5">
                <NumField
                  label="Age"
                  value={form.age}
                  onChange={(v) => update('age', v)}
                  hint="yrs"
                  min={1}
                  max={120}
                  step={1}
                  badge={autoBadges.age}
                  error={formErrors.age}
                />
                <PillToggle
                  label="Sex"
                  value={form.gender}
                  onChange={(v) => update('gender', v)}
                  options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]}
                  badge={autoBadges.gender}
                />
              </div>
            </div>
          )}

          {/* ══════ STEP 2: Body Vitals & Lifestyle ══════ */}
          {step === 1 && (
            <div className="space-y-6">
              <div className={cardCls}>
                <SectionHeader icon={FiActivity} title="Body Vitals" />
                <div className="grid sm:grid-cols-2 gap-5">
                  <NumField
                    label="Height"
                    value={form.height_cm}
                    onChange={(v) => update('height_cm', v)}
                    hint="cm"
                    min={50}
                    max={300}
                    step={1}
                    badge={autoBadges.height_cm}
                    error={formErrors.height_cm}
                  />
                  <NumField
                    label="Weight"
                    value={form.weight_kg}
                    onChange={(v) => update('weight_kg', v)}
                    hint="kg"
                    min={20}
                    max={500}
                    step={0.1}
                    badge={autoBadges.weight_kg}
                    error={formErrors.weight_kg}
                  />
                  <NumField
                    label="Waist"
                    value={form.waist_cm}
                    onChange={(v) => update('waist_cm', v)}
                    hint="cm"
                    min={30}
                    max={200}
                    step={1}
                    badge={autoBadges.waist_cm}
                    error={formErrors.waist_cm}
                  />
                  {/* BMI read-only */}
                  <div>
                    <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-1">BMI</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={bmi ?? '—'}
                        className={inputCls + ' cursor-default w-24'}
                      />
                      {bmi && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${bmiBadge(bmi).cls}`}>
                          {bmiBadge(bmi).label}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* WHtR read-only */}
                  <div>
                    <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-1">WHtR</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={whtr ?? '—'}
                        className={inputCls + ' cursor-default w-24'}
                      />
                      {whtr && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${whtrBadge(whtr).cls}`}>
                          {whtrBadge(whtr).label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={cardCls}>
                <SectionHeader icon={FiActivity} title="Lifestyle" />
                <div className="grid sm:grid-cols-2 gap-5">
                  <SelectField
                    label="Physical Activity"
                    value={form.physical_activity}
                    onChange={(v) => update('physical_activity', v)}
                    options={activityOpts}
                    badge={autoBadges.physical_activity}
                  />
                  <div className="sm:col-span-2 grid grid-cols-2 gap-5">
                    <TimeField label="Bedtime" value={form.bedtime} onChange={(v) => update('bedtime', v)} />
                    <TimeField label="Wake-up Time" value={form.wakeup_time} onChange={(v) => update('wakeup_time', v)} />
                  </div>
                  {sleepHours > 0 && (
                    <div className="sm:col-span-2 flex items-center gap-3 px-4 py-2.5 rounded-lg dark:bg-darkbg bg-lightbg">
                      <span className="text-xs dark:text-darksub text-lightsub">Sleep</span>
                      <span className="dark:text-darktext text-lighttext font-bold text-sm">{sleepHours} hrs</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          sleepHours >= 7 && sleepHours <= 9
                            ? 'text-green-400 bg-green-500/20'
                            : sleepHours >= 6
                            ? 'text-amber-400 bg-amber-500/20'
                            : 'text-red-400 bg-red-500/20'
                        }`}
                      >
                        {sleepHours >= 7 && sleepHours <= 9 ? 'Optimal' : sleepHours >= 6 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  )}
                  <PillCards
                    label="Stress Level"
                    value={form.stress_level}
                    onChange={(v) => update('stress_level', v)}
                    options={stressOpts}
                    colorMap={stressMap}
                    badge={autoBadges.stress_level}
                  />
                  <PillCards
                    label="Smoking Status"
                    value={form.smoking}
                    onChange={(v) => update('smoking', v)}
                    options={smokingOpts}
                    badge={autoBadges.smoking}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════ STEP 3: Diet & Medical History ══════ */}
          {step === 2 && (
            <div className="space-y-6">
              <div className={cardCls}>
                <SectionHeader icon={FiCoffee} title="Dietary Intake" />
                <div className="grid sm:grid-cols-2 gap-5">
                  <PillCards
                    label="Fried Food"
                    value={form.fried_food}
                    onChange={(v) => update('fried_food', v)}
                    options={levelOpts}
                    badge="fresh"
                  />
                  <PillCards
                    label="Sugar Intake"
                    value={form.sugar_intake}
                    onChange={(v) => update('sugar_intake', v)}
                    options={levelOpts}
                    badge="fresh"
                  />
                  <PillCards
                    label="Salt Intake"
                    value={form.salt_intake}
                    onChange={(v) => update('salt_intake', v)}
                    options={levelOpts}
                    badge="fresh"
                  />
                  <PillCards
                    label="Water Intake"
                    value={form.water_intake}
                    onChange={(v) => update('water_intake', v)}
                    options={waterOpts}
                    badge={autoBadges.water_intake || 'fresh'}
                  />
                </div>
              </div>

              <div className={cardCls}>
                <SectionHeader icon={FiHeart} title="Medical History" />
                <div className="space-y-4">
                  <YesNoToggle
                    label="Family History of Heart Disease"
                    value={form.family_heart}
                    onChange={(v) => update('family_heart', v)}
                    badge={autoBadges.family_heart}
                  />
                  <YesNoToggle
                    label="Family History of Diabetes"
                    value={form.family_diabetes}
                    onChange={(v) => update('family_diabetes', v)}
                    badge={autoBadges.family_diabetes}
                  />
                  <div className="grid sm:grid-cols-2 gap-5 mt-4">
                    <PillCards
                      label="Chest Discomfort"
                      value={form.chest_discomfort}
                      onChange={(v) => update('chest_discomfort', v)}
                      options={discomfortOpts}
                      badge="fresh"
                    />
                    <PillCards
                      label="Excessive Thirst"
                      value={form.excessive_thirst}
                      onChange={(v) => update('excessive_thirst', v)}
                      options={levelOpts}
                      badge="fresh"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation Buttons ── */}
      <div className="flex justify-between mt-8 gap-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border dark:border-darkborder border-lightborder dark:text-darksub text-lightsub hover:border-primary/40 hover:text-primary transition-all font-medium"
          >
            <FiArrowLeft size={16} /> Back
          </button>
        ) : (
          <div />
        )}

        {step < stepLabels.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              const { errors: allE } = validateForm(formPayload);
              const stepFields = step === 0
                ? ['age', 'sex']
                : ['height_cm', 'weight_kg', 'waist_cm', 'physical_activity', 'sleep_hours'];
              const stepErrors = {};
              stepFields.forEach((f) => { if (allE[f]) stepErrors[f] = allE[f]; });
              if (Object.keys(stepErrors).length > 0) { setFormErrors(stepErrors); return; }
              setFormErrors({});
              setStep((s) => s + 1);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-semibold transition-colors"
          >
            Next <FiArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-bold text-base transition-colors disabled:opacity-60"
          >
            Submit &amp; Analyze
          </button>
        )}
      </div>
    </div>
  );
}
