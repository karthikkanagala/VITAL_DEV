import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import useRiskPrediction from '../../hooks/useRiskPrediction';
import LoadingPulse from '../ui/LoadingPulse';
import { validateForm } from '../../utils/validateForm';
import {
  FiMic, FiMicOff, FiCheck,
  FiUser, FiActivity, FiHeart, FiCoffee,
  FiClock, FiArrowLeft, FiArrowRight, FiPlus, FiMinus,
} from 'react-icons/fi';

/* ═══ voice helper ═══ */
function useSpeech() {
  const [listening, setListening] = useState(false);
  const [done, setDone] = useState(false);
  const recRef = useRef(null);

  const toggle = useCallback((onResult) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.trim();
      onResult(text);
      setListening(false);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  }, [listening]);

  return { listening, toggle, done };
}

/* ═══ shared classes ═══ */
const inputCls =
  'w-full dark:bg-darkcard bg-white border dark:border-darkborder border-lightborder rounded-lg px-4 py-2.5 dark:text-white text-darkbg dark:placeholder-[#3A4A3E] placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors';

function MicButton({ field, onResult, speech }) {
  return (
    <button
      type="button"
      onClick={() =>
        speech.toggle((text) => {
          const num = parseFloat(text.replace(/[^\d.]/g, ''));
          if (!isNaN(num)) onResult(num);
          else onResult(text);
        })
      }
      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
        speech.listening
          ? 'text-red-400 animate-pulse'
          : speech.done
          ? 'text-green-400'
          : 'dark:text-darksub text-lightsub hover:text-primary'
      }`}
      title="Voice input"
    >
      {speech.done ? <FiCheck size={16} /> : speech.listening ? <FiMicOff size={16} /> : <FiMic size={16} />}
    </button>
  );
}

function NumField({ label, value, onChange, hint, speech, min, max, step, error }) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={hint}
          className={inputCls + ' pr-10' + (error ? ' !border-red-500 focus:!border-red-500' : '')}
          required
        />
        <MicButton field={label} onResult={(v) => onChange(String(v))} speech={speech} />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">&#9888; {error}</p>}
    </div>
  );
}

function TextField({ label, value, onChange, type = 'text', placeholder, speech }) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls + ' pr-10'}
        />
        <MicButton field={label} onResult={(v) => onChange(String(v))} speech={speech} />
      </div>
    </div>
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-1">
        <FiClock className="inline mr-1 text-primary" size={14} />
        {label}
      </label>
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}

/* ═══ Pill Toggle (2 options) ═══ */
function PillToggle({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-2">{label}</label>
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
    </div>
  );
}

/* ═══ Pill Cards (multi options) ═══ */
function PillCards({ label, value, onChange, options, colorMap }) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-2">{label}</label>
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
    </div>
  );
}

/* ═══ Select Dropdown ═══ */
function SelectField({ label, value, onChange, options, speech }) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-1">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + ' pr-10'}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <MicButton
          field={label}
          onResult={(text) => {
            const match = options.find((o) => o.label.toLowerCase() === String(text).toLowerCase());
            if (match) onChange(match.value);
          }}
          speech={speech}
        />
      </div>
    </div>
  );
}

/* ═══ Yes/No Toggle Row ═══ */
function YesNoToggle({ label, value, onChange }) {
  const isYes = value === '1';
  return (
    <div className="flex items-center justify-between dark:bg-darkcard bg-white border dark:border-darkborder border-lightborder rounded-lg px-4 py-3">
      <span className="text-sm dark:text-darktext text-lighttext">{label}</span>
      <div className="flex gap-2">
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

/* ═══ badge helpers ═══ */
function bmiBadge(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', cls: 'text-cyan-400 bg-cyan-500/20' };
  if (bmi < 25)   return { label: 'Normal', cls: 'text-green-400 bg-green-500/20' };
  if (bmi < 30)   return { label: 'Overweight', cls: 'text-amber-400 bg-amber-500/20' };
  return { label: 'Obese', cls: 'text-red-400 bg-red-500/20' };
}
function whtrBadge(whtr) {
  if (whtr <= 0.5) return { label: 'Healthy', cls: 'text-green-400 bg-green-500/20' };
  if (whtr <= 0.6) return { label: 'Overweight', cls: 'text-amber-400 bg-amber-500/20' };
  return { label: 'High Risk', cls: 'text-red-400 bg-red-500/20' };
}

/* ───── sleep calculation ───── */
function calcSleepHours(bedtime, wakeup) {
  if (!bedtime || !wakeup) return 0;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeup.split(':').map(Number);
  let diff = (wh * 60 + wm) - (bh * 60 + bm);
  if (diff <= 0) diff += 1440;
  return Math.round((diff / 60) * 10) / 10;
}

/* ═══ section header ═══ */
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

/* ═══ Family Contact Card ═══ */
const relationOptions = ['Parent', 'Spouse', 'Sibling', 'Friend', 'Other'];

function FamilyContactCard({ index, member, onUpdate, inputCls, label }) {
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: '#121814' }}>
      <p className="text-xs font-semibold text-[#6a9a6e]">{label}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[#4a6a4e] mb-1">Name</label>
          <input
            type="text"
            placeholder="e.g. Mom"
            value={member.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-[#4a6a4e] mb-1">Relation</label>
          <select
            value={member.relation}
            onChange={(e) => onUpdate(index, 'relation', e.target.value)}
            className={inputCls}
          >
            <option value="">Select relation</option>
            {relationOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#4a6a4e] mb-1">Phone</label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={member.phone}
            onChange={(e) => onUpdate(index, 'phone', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-[#4a6a4e] mb-1">Email <span className="text-neon-500">*</span></label>
          <input
            type="email"
            placeholder="family@email.com"
            value={member.email}
            onChange={(e) => onUpdate(index, 'email', e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══ Step config ═══ */
const stepLabels = ['Personal Details', 'Body Vitals & Lifestyle', 'Diet & Medical History'];

/* ═══ default form data ═══ */
const defaultData = {
  name: '',
  email: '',
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

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function AssessmentForm() {
  const [form, setForm] = useState(defaultData);
  const [step, setStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [showSecondContact, setShowSecondContact] = useState(false);
  const { dispatch, state } = useAppContext();
  const { predict, loading } = useRiskPrediction();
  const navigate = useNavigate();
  const speech = useSpeech();

  const familyMembers = state.familyMembers;
  const updateFamily = (index, field, value) => {
    const updated = familyMembers.map((m, i) => i === index ? { ...m, [field]: value } : m);
    dispatch({ type: 'SET_FAMILY_MEMBERS', payload: updated });
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  /* auto-calc */
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

  const handleBlur = (field, value) => {
    const snap = { ...formPayload, [field]: value };
    const { errors } = validateForm(snap);
    setFormErrors((prev) => {
      const next = { ...prev };
      if (errors[field]) next[field] = errors[field];
      else delete next[field];
      return next;
    });
  };

  /* submit */
  const submit = async () => {
    const { isValid, errors } = validateForm(formPayload);
    if (!isValid) {
      setFormErrors(errors);
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(firstKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (errors.age || errors.sex) setStep(0);
      else if (errors.height_cm || errors.weight_kg || errors.waist_cm || errors.physical_activity || errors.sleep_hours) setStep(1);
      else setStep(2);
      return;
    }
    setFormErrors({});
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
    };
    dispatch({ type: 'SET_FORM_DATA', payload: { ...payload, name: form.name } });
    const results = await predict(payload);
    if (results) {
      dispatch({ type: 'SET_RESULTS', payload: results });
      navigate('/results');
    }
  };

  if (loading) return <LoadingPulse />;

  /* ── option sets ── */
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
    { value: '1', label: '1-2L' },
    { value: '2', label: '3-4L' },
    { value: '3', label: '> 4L' },
  ];
  const discomfortOpts = [
    { value: '0', label: 'Never' },
    { value: '1', label: 'Sometimes' },
    { value: '2', label: 'Often' },
  ];

  const requiredFields = [
    'age', 'sex', 'height_cm', 'weight_kg', 'waist_cm',
    'physical_activity', 'sleep_hours', 'stress_level',
    'smoking_status', 'fried_food', 'sugar_intake',
    'salt_intake', 'water_intake',
    'family_history_heart', 'family_history_diab',
    'chest_discomfort', 'excessive_thirst',
  ];
  const filled = requiredFields.filter((f) => {
    const v = formPayload[f];
    return v !== '' && v !== null && v !== undefined;
  }).length;

  const cardCls = 'dark:bg-darkcard bg-white border dark:border-darkborder border-lightborder rounded-2xl p-6 shadow-xl dark:shadow-none';
  const progress = ((step + 1) / stepLabels.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back to Dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-neon-500 text-sm mb-5 hover:opacity-80 transition-opacity"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <FiArrowLeft size={15} />
        Back to Dashboard
      </button>

      {/* ── Progress Bar ── */}
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
        <div className="flex justify-between items-center mt-3 mb-1">
          <span className="text-xs dark:text-darksub text-lightsub">{filled} of 17 fields complete</span>
          <span className="text-xs font-medium" style={{ color: '#00DC78' }}>{Math.round((filled / 17) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a2e1e' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(filled / 17) * 100}%`, background: '#00DC78' }}
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
                <TextField label="Full Name" value={form.name} onChange={(v) => update('name', v)} placeholder="Your name" speech={speech} />
                <TextField label="Email" value={form.email} onChange={(v) => update('email', v)} type="email" placeholder="you@email.com" speech={speech} />
                <NumField label="Age" value={form.age} onChange={(v) => update('age', v)} onBlur={(e) => handleBlur('age', e.target.value)} hint="yrs" speech={speech} min={1} max={120} step={1} error={formErrors.age} fieldId="age" />
                <PillToggle
                  label="Sex"
                  value={form.gender}
                  onChange={(v) => update('gender', v)}
                  options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]}
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
                  <NumField label="Height" value={form.height_cm} onChange={(v) => update('height_cm', v)} onBlur={(e) => handleBlur('height_cm', e.target.value)} hint="cm" speech={speech} min={50} max={300} step={1} error={formErrors.height_cm} fieldId="height_cm" />
                  <NumField label="Weight" value={form.weight_kg} onChange={(v) => update('weight_kg', v)} onBlur={(e) => handleBlur('weight_kg', e.target.value)} hint="kg" speech={speech} min={20} max={500} step={0.1} error={formErrors.weight_kg} fieldId="weight_kg" />
                  <NumField label="Waist" value={form.waist_cm} onChange={(v) => update('waist_cm', v)} onBlur={(e) => handleBlur('waist_cm', e.target.value)} hint="cm" speech={speech} min={30} max={200} step={1} error={formErrors.waist_cm} fieldId="waist_cm" />
                  {/* BMI read-only */}
                  <div>
                    <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-1">BMI</label>
                    <div className="flex items-center gap-2">
                      <input type="text" readOnly value={bmi ?? '—'} className={inputCls + ' bg-opacity-50 cursor-default w-24'} />
                      {bmi && <span className={`text-xs font-bold px-2 py-1 rounded-full ${bmiBadge(bmi).cls}`}>{bmiBadge(bmi).label}</span>}
                    </div>
                  </div>
                  {/* WHtR read-only */}
                  <div>
                    <label className="block text-sm font-medium dark:text-darktext text-lighttext mb-1">WHtR</label>
                    <div className="flex items-center gap-2">
                      <input type="text" readOnly value={whtr ?? '—'} className={inputCls + ' bg-opacity-50 cursor-default w-24'} />
                      {whtr && <span className={`text-xs font-bold px-2 py-1 rounded-full ${whtrBadge(whtr).cls}`}>{whtrBadge(whtr).label}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className={cardCls}>
                <SectionHeader icon={FiActivity} title="Lifestyle" />
                <div className="grid sm:grid-cols-2 gap-5">
                  <SelectField label="Physical Activity" value={form.physical_activity} onChange={(v) => update('physical_activity', v)} options={activityOpts} speech={speech} />
                  <div className="sm:col-span-2 grid grid-cols-2 gap-5">
                    <TimeField label="Bedtime" value={form.bedtime} onChange={(v) => update('bedtime', v)} />
                    <TimeField label="Wake-up Time" value={form.wakeup_time} onChange={(v) => update('wakeup_time', v)} />
                  </div>
                  {sleepHours > 0 && (
                    <div className="sm:col-span-2 flex items-center gap-3 px-4 py-2.5 rounded-lg dark:bg-darkbg bg-lightbg">
                      <span className="text-xs dark:text-darksub text-lightsub">Sleep</span>
                      <span className="dark:text-darktext text-lighttext font-bold text-sm">{sleepHours} hrs</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        sleepHours >= 7 && sleepHours <= 9 ? 'text-green-400 bg-green-500/20'
                          : sleepHours >= 6 ? 'text-amber-400 bg-amber-500/20' : 'text-red-400 bg-red-500/20'
                      }`}>
                        {sleepHours >= 7 && sleepHours <= 9 ? 'Optimal' : sleepHours >= 6 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  )}
                  <PillCards label="Stress Level" value={form.stress_level} onChange={(v) => update('stress_level', v)} options={stressOpts} colorMap={stressMap} />
                  <PillCards label="Smoking Status" value={form.smoking} onChange={(v) => update('smoking', v)} options={smokingOpts} />
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
                  <PillCards label="Fried Food" value={form.fried_food} onChange={(v) => update('fried_food', v)} options={levelOpts} />
                  <PillCards label="Sugar Intake" value={form.sugar_intake} onChange={(v) => update('sugar_intake', v)} options={levelOpts} />
                  <PillCards label="Salt Intake" value={form.salt_intake} onChange={(v) => update('salt_intake', v)} options={levelOpts} />
                  <PillCards label="Water Intake" value={form.water_intake} onChange={(v) => update('water_intake', v)} options={waterOpts} />
                </div>
              </div>

              <div className={cardCls}>
                <SectionHeader icon={FiHeart} title="Medical History" />
                <div className="space-y-4">
                  <YesNoToggle label="Family History of Heart Disease" value={form.family_heart} onChange={(v) => update('family_heart', v)} />
                  <YesNoToggle label="Family History of Diabetes" value={form.family_diabetes} onChange={(v) => update('family_diabetes', v)} />
                  <div className="grid sm:grid-cols-2 gap-5 mt-4">
                    <PillCards label="Chest Discomfort" value={form.chest_discomfort} onChange={(v) => update('chest_discomfort', v)} options={discomfortOpts} />
                    <PillCards label="Excessive Thirst" value={form.excessive_thirst} onChange={(v) => update('excessive_thirst', v)} options={levelOpts} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Emergency Contacts (Step 3 only) ── */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-2xl border border-dashed border-[#2a3a2e] p-5"
            style={{ background: '#0d1a0f' }}
          >
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">👨‍👩‍👧 Emergency Contacts <span className="text-[#4a6a4e] font-normal">(Optional)</span></h3>
              <p className="text-xs text-[#4a6a4e] mt-0.5">We&apos;ll alert them only if your risk score is 70% or above.</p>
            </div>

            {/* Contact 1 */}
            <FamilyContactCard
              index={0}
              member={familyMembers[0]}
              onUpdate={updateFamily}
              inputCls={inputCls}
              label="Family Member 1"
            />

            {/* Add / remove second contact */}
            <AnimatePresence>
              {showSecondContact ? (
                <motion.div
                  key="contact2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <FamilyContactCard
                    index={1}
                    member={familyMembers[1]}
                    onUpdate={updateFamily}
                    inputCls={inputCls}
                    label="Family Member 2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecondContact(false)}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors mt-3"
                  >
                    <FiMinus size={12} /> Remove second contact
                  </button>
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSecondContact(true)}
                  className="flex items-center gap-1.5 text-xs text-neon-500 hover:text-neon-400 transition-colors mt-4 font-semibold"
                >
                  <FiPlus size={12} /> Add another contact
                </button>
              )}
            </AnimatePresence>

            <p className="text-xs mt-4" style={{ color: '#F59E0B' }}>
              ⚠️ Emergency alerts are only sent when risk score reaches 70% or above. Your family&apos;s email is never shared or stored permanently.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation Buttons ── */}
      <div className="flex justify-between mt-8 gap-4">        {step > 0 ? (
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
          Object.keys(formErrors).length > 0 ? (
            <button
              type="button"
              onClick={submit}
              style={{ opacity: 0.7 }}
              className="flex-1 py-3.5 rounded-xl bg-primary text-darkbg font-bold text-base transition-colors"
            >
              ⚠ Fix {Object.keys(formErrors).length} errors to continue
            </button>
          ) : filled < 17 ? (
            <button
              type="button"
              onClick={submit}
              style={{ opacity: 0.7 }}
              className="flex-1 py-3.5 rounded-xl bg-primary text-darkbg font-bold text-base transition-colors"
            >
              Fill all fields to continue ({17 - filled} remaining)
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-bold text-base transition-colors"
            >
              Analyze My Risk →
            </button>
          )
        )}
      </div>
    </div>
  );
}
