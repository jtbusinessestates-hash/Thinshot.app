import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Syringe, Scale, Target, Bell, Sparkles,
  ChevronRight, ChevronLeft, Check, Pill,
  Sun, Moon, Sunset
} from 'lucide-react';

const MEDICATIONS = [
  { id: 'ozempic',   label: 'Ozempic',   sub: 'Semaglutide · Weekly' },
  { id: 'wegovy',    label: 'Wegovy',    sub: 'Semaglutide · Weekly' },
  { id: 'mounjaro',  label: 'Mounjaro',  sub: 'Tirzepatide · Weekly' },
  { id: 'saxenda',   label: 'Saxenda',   sub: 'Liraglutide · Daily' },
  { id: 'zepbound',  label: 'Zepbound',  sub: 'Tirzepatide · Weekly' },
  { id: 'other',     label: 'Other',     sub: 'Enter your own' },
];

const OZEMPIC_DOSES  = ['0.25mg', '0.5mg', '1.0mg', '2.0mg'];
const WEGOVY_DOSES   = ['0.25mg', '0.5mg', '1.0mg', '1.7mg', '2.4mg'];
const MOUNJARO_DOSES = ['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg', '15mg'];
const SAXENDA_DOSES  = ['0.6mg', '1.2mg', '1.8mg', '2.4mg', '3.0mg'];
const ZEPBOUND_DOSES = ['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg', '15mg'];
const DAYS_OF_WEEK   = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function dosesFor(med) {
  if (med === 'ozempic')  return OZEMPIC_DOSES;
  if (med === 'wegovy')   return WEGOVY_DOSES;
  if (med === 'mounjaro') return MOUNJARO_DOSES;
  if (med === 'saxenda')  return SAXENDA_DOSES;
  if (med === 'zepbound') return ZEPBOUND_DOSES;
  return [];
}

function ProgressBar({ step, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < step ? 'bg-[#2ECC71]' : i === step ? 'bg-[#2ECC71]/40' : 'bg-gray-200'}`} />
      ))}
    </div>
  );
}

function StepWelcome({ userName, onNext }) {
  return (
    <div className="text-center flex flex-col items-center gap-6">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#2ECC71] to-emerald-400 flex items-center justify-center shadow-xl shadow-[#2ECC71]/30">
        <Syringe className="w-12 h-12 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading mb-3">Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋</h1>
        <p className="text-gray-500 text-base max-w-sm mx-auto leading-relaxed">You're one step away from taking control of your GLP-1 journey. Let's get your account set up in about 60 seconds.</p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm mt-2">
        {[
          { icon: <Syringe className="w-5 h-5 text-[#2ECC71]" />, label: 'Track doses' },
          { icon: <Scale className="w-5 h-5 text-[#2ECC71]" />,   label: 'Log weight' },
          { icon: <Sparkles className="w-5 h-5 text-[#2ECC71]" />, label: 'AI insights' },
        ].map(({ icon, label }) => (
          <div key={label} className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-[#2ECC71]/10 rounded-xl flex items-center justify-center">{icon}</div>
            <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
          </div>
        ))}
      </div>
      <Button size="lg" className="w-full max-w-sm bg-[#2ECC71] hover:bg-[#27ae60] text-white font-semibold h-12 rounded-xl" onClick={onNext}>
        Let's Get Started <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
      <p className="text-xs text-gray-400">Your 7-day Pro trial starts automatically — no card needed</p>
    </div>
  );
}

function StepMedication({ data, onChange, onNext, onBack }) {
  const doses = dosesFor(data.medication);
  const isOther = data.medication === 'other';
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-1">Your medication</h2>
        <p className="text-gray-500 text-sm">Which GLP-1 are you currently on?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {MEDICATIONS.map(({ id, label, sub }) => (
          <button key={id} onClick={() => onChange({ medication: id, dose: '', customMed: '' })}
            className={`text-left p-4 rounded-2xl border-2 transition-all ${data.medication === id ? 'border-[#2ECC71] bg-[#2ECC71]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
              {data.medication === id && <div className="w-5 h-5 rounded-full bg-[#2ECC71] flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-white" /></div>}
            </div>
          </button>
        ))}
      </div>
      {isOther && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Medication name</Label>
          <Input placeholder="e.g. Rybelsus, Victoza..." value={data.customMed || ''} onChange={e => onChange({ customMed: e.target.value })} className="rounded-xl h-11" />
        </div>
      )}
      {data.medication && !isOther && doses.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Current dose</Label>
          <div className="flex flex-wrap gap-2">
            {doses.map(d => (
              <button key={d} onClick={() => onChange({ dose: d })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${data.dose === d ? 'border-[#2ECC71] bg-[#2ECC71] text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
      {isOther && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Current dose</Label>
          <Input placeholder="e.g. 1.0mg" value={data.dose || ''} onChange={e => onChange({ dose: e.target.value })} className="rounded-xl h-11" />
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">When did you start? <span className="text-gray-400 font-normal">(approximate is fine)</span></Label>
        <Input type="date" value={data.startDate || ''} onChange={e => onChange({ startDate: e.target.value })} className="rounded-xl h-11" max={new Date().toISOString().split('T')[0]} />
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Button className="flex-1 bg-[#2ECC71] hover:bg-[#27ae60] text-white rounded-xl h-11" onClick={onNext} disabled={!data.medication || (!data.dose && !isOther)}>
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function StepGoals({ data, onChange, onNext, onBack }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-1">Your goals</h2>
        <p className="text-gray-500 text-sm">Help Sage personalise your experience</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">Starting weight</Label>
        <div className="flex gap-2">
          <Input type="number" placeholder="e.g. 90" value={data.startingWeight || ''} onChange={e => onChange({ startingWeight: e.target.value })} className="rounded-xl h-11 flex-1" min="1" />
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {['kg', 'lbs'].map(u => (
              <button key={u} onClick={() => onChange({ weightUnit: u })}
                className={`px-4 h-11 text-sm font-semibold transition-all ${(data.weightUnit || 'lbs') === u ? 'bg-[#2ECC71] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">Goal weight</Label>
        <Input type="number" placeholder="e.g. 70" value={data.goalWeight || ''} onChange={e => onChange({ goalWeight: e.target.value })} className="rounded-xl h-11" min="1" />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">My main goal</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Lose weight', 'Build habits', 'Manage side effects', 'Feel better'].map(g => (
            <button key={g} onClick={() => onChange({ mainGoal: g })}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${data.mainGoal === g ? 'border-[#2ECC71] bg-[#2ECC71]/5 text-[#2ECC71]' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Button className="flex-1 bg-[#2ECC71] hover:bg-[#27ae60] text-white rounded-xl h-11" onClick={onNext}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );
}

function StepSchedule({ data, onChange, onNext, onBack }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-1">Your schedule</h2>
        <p className="text-gray-500 text-sm">We'll send reminders to keep you on track</p>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Injection day</Label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map(d => (
            <button key={d} onClick={() => onChange({ injectionDay: d })}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${data.injectionDay === d ? 'border-[#2ECC71] bg-[#2ECC71] text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Preferred reminder time</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'morning', label: 'Morning', sub: '8:00 AM', icon: <Sun className="w-5 h-5" /> },
            { id: 'afternoon', label: 'Afternoon', sub: '12:00 PM', icon: <Sunset className="w-5 h-5" /> },
            { id: 'evening', label: 'Evening', sub: '7:00 PM', icon: <Moon className="w-5 h-5" /> },
          ].map(({ id, label, sub, icon }) => (
            <button key={id} onClick={() => onChange({ reminderTime: id })}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${data.reminderTime === id ? 'border-[#2ECC71] bg-[#2ECC71]/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className={data.reminderTime === id ? 'text-[#2ECC71]' : 'text-gray-400'}>{icon}</div>
              <p className="text-xs font-semibold text-gray-800">{label}</p>
              <p className="text-[10px] text-gray-500">{sub}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
        <div>
          <p className="text-sm font-semibold text-gray-800">Enable reminders</p>
          <p className="text-xs text-gray-500">Get notified on your injection day</p>
        </div>
        <button onClick={() => onChange({ remindersEnabled: !data.remindersEnabled })}
          className={`w-12 h-6 rounded-full transition-all relative ${data.remindersEnabled ? 'bg-[#2ECC71]' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${data.remindersEnabled ? 'left-[26px]' : 'left-0.5'}`} />
        </button>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Button className="flex-1 bg-[#2ECC71] hover:bg-[#27ae60] text-white rounded-xl h-11" onClick={onNext}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );
}

function StepSage({ userName, medication, onFinish, finishing }) {
  const med = MEDICATIONS.find(m => m.id === medication)?.label || medication;
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-xl shadow-violet-500/30">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#2ECC71] rounded-full flex items-center justify-center border-2 border-white">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-2">Meet Sage 👋</h2>
        <p className="text-gray-500 text-sm max-w-sm">Your personal AI health coach — available 24/7 to answer questions, explain side effects, and keep you on track.</p>
      </div>
      <div className="w-full max-w-sm bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5 text-left">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-violet-700">Sage</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          Hi{userName ? ` ${userName.split(' ')[0]}` : ''}! I'm Sage, your GLP-1 co-pilot 🌿
          {med && med !== 'Other' ? ` I see you're on ${med} — great choice.` : ''}
          {' '}I'll be here to answer questions, explain any side effects you're feeling, and celebrate every milestone with you.
          <br /><br />
          Your 7-day Pro trial is now <strong>active</strong>. Let's get started!
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {['💊 Explain dose side effects', '📈 Analyse your weight trends', '🩺 Prep for doctor visits', '🎯 Keep you motivated'].map(item => (
          <div key={item} className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 text-left">{item}</div>
        ))}
      </div>
      <Button size="lg" className="w-full max-w-sm bg-[#2ECC71] hover:bg-[#27ae60] text-white font-semibold h-12 rounded-xl gap-2" onClick={onFinish} disabled={finishing}>
        {finishing ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up your account...</>
        ) : (
          <><Check className="w-4 h-4" /> Go to My Dashboard</>
        )}
      </Button>
    </div>
  );
}

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [checking, setChecking] = useState(true);

  const [formData, setFormData] = useState({
    medication: '',
    customMed: '',
    dose: '',
    startDate: '',
    startingWeight: '',
    goalWeight: '',
    weightUnit: 'lbs',
    mainGoal: '',
    injectionDay: '',
    reminderTime: 'morning',
    remindersEnabled: true,
  });

  useEffect(() => {
    let attempts = 0;
    async function check() {
      attempts++;
      try {
        const u = await base44.auth.me();
        setUser(u);
        const settings = await base44.entities.UserSettings.list('-created_date', 1);
        if (settings && settings.length > 0 && settings[0].onboarding_complete === true) {
          window.location.href = '/dashboard';
          return;
        }
        setChecking(false);
      } catch (e) {
        if (attempts < 5) {
          setTimeout(check, 800);
        } else {
          setChecking(false);
        }
      }
    }
    check();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2ECC71]/30 border-t-[#2ECC71] rounded-full animate-spin" />
      </div>
    );
  }

  const update = (patch) => setFormData(prev => ({ ...prev, ...patch }));

  const handleFinish = async () => {
    setFinishing(true);
    try {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const timeMap = { morning: '08:00', afternoon: '12:00', evening: '19:00' };
      const reminderTime = timeMap[formData.reminderTime] || '08:00';
      const existingSettings = await base44.entities.UserSettings.list('-created_date', 1).catch(() => []);
      const refCode = localStorage.getItem('thinshot_ref_code') || null;
      if (refCode) localStorage.removeItem('thinshot_ref_code');
      const refAmbassador = localStorage.getItem('thinshot_ref') || null;
      if (refAmbassador) {
        localStorage.removeItem('thinshot_ref');
        base44.functions.invoke('trackReferral', { referral_code: refAmbassador, event_type: 'signup', user_email: user?.email }).catch(() => {});
      }
      const settingsPayload = {
        onboarding_complete: true,
        ...(refCode ? { referred_by: refCode } : {}),
        subscription_status: 'trial',
        is_pro: true,
        trial_end: trialEnd,
        weight_unit: formData.weightUnit,
        starting_weight: formData.startingWeight ? parseFloat(formData.startingWeight) : null,
        goal_weight: formData.goalWeight ? parseFloat(formData.goalWeight) : null,
        injection_day: formData.injectionDay || null,
        reminder_enabled: formData.remindersEnabled,
        reminder_injection: formData.remindersEnabled,
        reminder_checkin: formData.remindersEnabled,
        reminder_time: reminderTime,
        reminder_time_injection: reminderTime,
        reminder_time_checkin: reminderTime,
        country: 'United States',
      };
      if (existingSettings?.[0]) {
        await base44.entities.UserSettings.update(existingSettings[0].id, settingsPayload);
      } else {
        await base44.entities.UserSettings.create(settingsPayload);
      }
      const medName = formData.medication === 'other' ? formData.customMed : MEDICATIONS.find(m => m.id === formData.medication)?.label || '';
      if (medName && formData.dose) {
        await base44.entities.MedicationLog.create({
          drug_name: formData.medication !== 'other' ? medName : 'Other',
          custom_drug_name: formData.medication === 'other' ? formData.customMed : null,
          dose_mg: parseFloat(formData.dose) || 0,
          injection_site: 'Abdomen',
          injection_date: formData.startDate || now.toISOString().split('T')[0],
          notes: 'First log — added during onboarding',
        }).catch(() => {});
      }
      if (formData.startingWeight) {
        await base44.entities.WeightLog.create({
          weight: parseFloat(formData.startingWeight),
          unit: formData.weightUnit,
          date: formData.startDate || now.toISOString().split('T')[0],
          notes: 'Starting weight — added during onboarding',
        }).catch(() => {});
      }
      const med = formData.medication === 'other' ? formData.customMed : MEDICATIONS.find(m => m.id === formData.medication)?.label || '';
      await base44.entities.SageMessage.create({
        role: 'assistant',
        content: `Hi${user?.full_name ? ` ${user.full_name.split(' ')[0]}` : ''}! I'm Sage, your personal GLP-1 co-pilot 🌿${med ? ` I see you're on ${med}${formData.dose ? ` at ${formData.dose}` : ''}.` : ''} Your 7-day Pro trial is now active — all features are unlocked. Let's do this! 💪`,
        created_at: now.toISOString(),
      }).catch(() => {});
      window.location.href = '/dashboard';
    } catch (err) {
      window.location.href = '/dashboard';
    }
  };

  const steps = [
    <StepWelcome key="welcome" userName={user?.full_name} onNext={() => setStep(1)} />,
    <StepMedication key="medication" data={formData} onChange={update} onNext={() => setStep(2)} onBack={() => setStep(0)} />,
    <StepGoals key="goals" data={formData} onChange={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />,
    <StepSchedule key="schedule" data={formData} onChange={update} onNext={() => setStep(4)} onBack={() => setStep(2)} />,
    <StepSage key="sage" userName={user?.full_name} medication={formData.medication} onFinish={handleFinish} finishing={finishing} />,
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/80 p-8">
        <ProgressBar step={step} total={TOTAL_STEPS} />
        {steps[step]}
      </div>
    </div>
  );
}