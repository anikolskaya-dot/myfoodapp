import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Macros } from '../types';
import { calculateMacros } from '../utils';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingProps {
  onComplete: (profile: UserProfile, macros: Macros) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    emoji: '👤',
    gender: 'male',
    age: 25,
    height: 175,
    weight: 70,
    goal: 'maintain',
    activityLevel: 1.375,
  });

  const steps = [
    { title: 'Как тебя зовут?', field: 'name' },
    { title: 'Твой пол', field: 'gender' },
    { title: 'Твой возраст', field: 'age' },
    { title: 'Твой рост', field: 'height' },
    { title: 'Твой вес', field: 'weight' },
    { title: 'Твоя цель', field: 'goal' },
    { title: 'Результат', field: 'result' },
  ];

  const emojis = ['👤', '🦁', '🦊', '🐼', '🐨', '🐯', '🐸', '🦄', '🥑', '🍎', '💪', '🏃', '🧘'];

  const nextStep = () => {
    if (step === 0 && !profile.name.trim()) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  useEffect(() => {
    if (step === 6) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    }
  }, [step]);

  const targetMacros = calculateMacros(profile);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="mt-8 space-y-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => setProfile({ ...profile, emoji: e })}
                  className={`text-3xl p-3 rounded-2xl border-2 transition-all ${profile.emoji === e ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Твое имя"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-xl font-semibold focus:outline-none focus:border-blue-500 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && nextStep()}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={() => { setProfile({ ...profile, gender: 'male' }); nextStep(); }}
              className={`flex flex-col items-center p-8 rounded-3xl border-2 transition-all ${profile.gender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}
            >
              <span className="text-6xl mb-4">👨</span>
              <span className="font-semibold">Мужчина</span>
            </button>
            <button
              onClick={() => { setProfile({ ...profile, gender: 'female' }); nextStep(); }}
              className={`flex flex-col items-center p-8 rounded-3xl border-2 transition-all ${profile.gender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 bg-white'}`}
            >
              <span className="text-6xl mb-4">👩</span>
              <span className="font-semibold">Женщина</span>
            </button>
          </div>
        );
      case 2:
        return (
          <div className="mt-8 text-center">
            <div className="text-7xl font-bold text-blue-600 mb-8 font-display">{profile.age}</div>
            <input
              type="range"
              min="13"
              max="100"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2 text-slate-400 text-sm">
              <span>13 лет</span>
              <span>100 лет</span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mt-8 text-center">
            <div className="text-7xl font-bold text-blue-600 mb-8 font-display">{profile.height} <span className="text-2xl text-slate-400">см</span></div>
            <input
              type="range"
              min="120"
              max="220"
              value={profile.height}
              onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2 text-slate-400 text-sm">
              <span>120 см</span>
              <span>220 см</span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="mt-8 text-center">
            <div className="text-7xl font-bold text-blue-600 mb-8 font-display">{profile.weight} <span className="text-2xl text-slate-400">кг</span></div>
            <input
              type="range"
              min="30"
              max="200"
              step="0.5"
              value={profile.weight}
              onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2 text-slate-400 text-sm">
              <span>30 кг</span>
              <span>200 кг</span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-4 mt-8">
            {[
              { id: 'lose', label: 'Похудеть', icon: '🥗' },
              { id: 'maintain', label: 'Поддерживать', icon: '⚖️' },
              { id: 'gain', label: 'Набрать массу', icon: '💪' },
            ].map((goal) => (
              <button
                key={goal.id}
                onClick={() => { setProfile({ ...profile, goal: goal.id as any }); nextStep(); }}
                className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${profile.goal === goal.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}
              >
                <span className="text-3xl">{goal.icon}</span>
                <span className="font-semibold text-lg">{goal.label}</span>
                {profile.goal === goal.id && <Check className="ml-auto text-blue-500" />}
              </button>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="mt-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="text-slate-500 uppercase tracking-widest text-sm font-bold mb-2">Твоя цель</div>
              <div className="text-6xl font-bold text-slate-900 font-display">{targetMacros.calories} <span className="text-2xl">Ккал</span></div>
            </motion.div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Белки', value: targetMacros.protein, color: 'bg-blue-500' },
                { label: 'Жиры', value: targetMacros.fat, color: 'bg-amber-400' },
                { label: 'Углеводы', value: targetMacros.carbs, color: 'bg-emerald-500' },
              ].map((m) => (
                <div key={m.label} className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold mb-2 ${m.color}`}>
                    {m.value}г
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-12 grid grid-cols-2 gap-4">
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Вода</div>
                <div className="text-lg font-bold text-blue-600">{targetMacros.water} мл</div>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Шаги</div>
                <div className="text-lg font-bold text-emerald-600">{targetMacros.steps}</div>
              </div>
            </div>

            <button
              onClick={() => onComplete(profile, targetMacros)}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
            >
              Начать вести дневник
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-8">
        {step > 0 && step < 6 ? (
          <button onClick={prevStep} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
            <ChevronLeft size={24} />
          </button>
        ) : <div className="w-10 h-10" />}
        
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-blue-600' : 'w-2 bg-slate-100'}`}
            />
          ))}
        </div>
        
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">
              {step === 6 ? `Привет, ${profile.name}!` : steps[step].title}
            </h1>
            {step === 0 && <p className="text-slate-500">Давай познакомимся поближе</p>}
            
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {step > 0 && step < 5 && (
        <button
          onClick={nextStep}
          className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
        >
          Далее <ChevronRight size={20} />
        </button>
      )}
      {step === 0 && (
        <button
          onClick={nextStep}
          disabled={!profile.name.trim()}
          className={`mt-8 w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors ${profile.name.trim() ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          Далее <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
