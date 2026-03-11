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
    healthIssues: [],
  });

  const steps = [
    { title: 'Ваше имя', field: 'name' },
    { title: 'Ваш аватар', field: 'emoji' },
    { title: 'Ваш пол', field: 'gender' },
    { title: 'Ваш возраст', field: 'age' },
    { title: 'Ваш рост', field: 'height' },
    { title: 'Ваш вес', field: 'weight' },
    { title: 'Состояние здоровья', field: 'healthIssues' },
    { title: 'Ваша цель', field: 'goal' },
    { title: 'Ваш план', field: 'result' },
  ];

  const healthOptions = [
    { id: 'none', label: 'Нет ограничений', icon: '✅' },
    { id: 'heart', label: 'Сердечно-сосудистые заболевания', icon: '❤️' },
    { id: 'diabetes', label: 'Сахарный диабет', icon: '🩸' },
    { id: 'thyroid', label: 'Заболевания щитовидной железы', icon: '🦋' },
    { id: 'hypertension', label: 'Гипертония', icon: '🩺' },
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
    if (step === 8) {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981']
      });
    }
  }, [step]);

  const targetMacros = calculateMacros(profile);

  const toggleHealthIssue = (id: string) => {
    if (id === 'none') {
      setProfile({ ...profile, healthIssues: [] });
      return;
    }
    const newIssues = profile.healthIssues.includes(id)
      ? profile.healthIssues.filter(i => i !== id)
      : [...profile.healthIssues, id];
    setProfile({ ...profile, healthIssues: newIssues });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="mt-12">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Введите имя</label>
            <input
              autoFocus
              type="text"
              placeholder="Александр"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-transparent border-b-2 border-zinc-800 py-4 text-3xl font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && nextStep()}
            />
            <p className="mt-4 text-zinc-500 text-sm">Это имя будет использоваться в вашем личном кабинете.</p>
          </div>
        );
      case 1:
        return (
          <div className="mt-8">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Выберите иконку профиля</label>
            <div className="grid grid-cols-4 gap-4">
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => { setProfile({ ...profile, emoji: e }); setTimeout(nextStep, 200); }}
                  className={`text-3xl aspect-square flex items-center justify-center rounded-xl border transition-all ${profile.emoji === e ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 gap-4 mt-12">
            <button
              onClick={() => { setProfile({ ...profile, gender: 'male' }); nextStep(); }}
              className={`flex flex-col items-center p-10 rounded-2xl border transition-all ${profile.gender === 'male' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
            >
              <span className="text-4xl mb-4 opacity-80">👨</span>
              <span className="font-medium text-zinc-300">Мужчина</span>
            </button>
            <button
              onClick={() => { setProfile({ ...profile, gender: 'female' }); nextStep(); }}
              className={`flex flex-col items-center p-10 rounded-2xl border transition-all ${profile.gender === 'female' ? 'border-pink-500 bg-pink-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
            >
              <span className="text-4xl mb-4 opacity-80">👩</span>
              <span className="font-medium text-zinc-300">Женщина</span>
            </button>
          </div>
        );
      case 3:
        return (
          <div className="mt-12 text-center">
            <div className="text-8xl font-bold text-white mb-12 tracking-tighter">{profile.age}</div>
            <input
              type="range"
              min="13"
              max="100"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between mt-4 text-zinc-600 text-xs font-bold uppercase tracking-widest">
              <span>13 лет</span>
              <span>100 лет</span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="mt-12 text-center">
            <div className="text-8xl font-bold text-white mb-12 tracking-tighter">{profile.height} <span className="text-2xl text-zinc-600">см</span></div>
            <input
              type="range"
              min="120"
              max="220"
              value={profile.height}
              onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between mt-4 text-zinc-600 text-xs font-bold uppercase tracking-widest">
              <span>120 см</span>
              <span>220 см</span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="mt-12 text-center">
            <div className="text-8xl font-bold text-white mb-12 tracking-tighter">{profile.weight} <span className="text-2xl text-zinc-600">кг</span></div>
            <input
              type="range"
              min="30"
              max="200"
              step="0.5"
              value={profile.weight}
              onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between mt-4 text-zinc-600 text-xs font-bold uppercase tracking-widest">
              <span>30 кг</span>
              <span>200 кг</span>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col gap-3 mt-8">
            {healthOptions.map((option) => {
              const isActive = option.id === 'none' 
                ? profile.healthIssues.length === 0 
                : profile.healthIssues.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleHealthIssue(option.id)}
                  className={`flex items-center gap-4 p-5 rounded-xl border transition-all text-left ${isActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                >
                  <span className="text-xl opacity-80">{option.icon}</span>
                  <span className="font-medium text-zinc-200">{option.label}</span>
                  {isActive && <Check className="ml-auto text-blue-500" size={20} />}
                </button>
              );
            })}
          </div>
        );
      case 7:
        return (
          <div className="flex flex-col gap-4 mt-8">
            {[
              { id: 'lose', label: 'Снижение веса', icon: '🥗' },
              { id: 'maintain', label: 'Поддержание формы', icon: '⚖️' },
              { id: 'gain', label: 'Набор мышечной массы', icon: '💪' },
            ].map((goal) => (
              <button
                key={goal.id}
                onClick={() => { setProfile({ ...profile, goal: goal.id as any }); nextStep(); }}
                className={`flex items-center gap-4 p-6 rounded-xl border transition-all text-left ${profile.goal === goal.id ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
              >
                <span className="text-2xl opacity-80">{goal.icon}</span>
                <span className="font-medium text-zinc-200">{goal.label}</span>
                {profile.goal === goal.id && <Check className="ml-auto text-blue-500" size={20} />}
              </button>
            ))}
          </div>
        );
      case 8:
        return (
          <div className="mt-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8 text-center">
              <div className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-4">Рекомендуемая норма</div>
              <div className="text-7xl font-bold text-white tracking-tighter mb-2">{targetMacros.calories}</div>
              <div className="text-zinc-400 font-medium">килокалорий в день</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: 'Белки', value: targetMacros.protein, color: 'bg-blue-600' },
                { label: 'Жиры', value: targetMacros.fat, color: 'bg-amber-600' },
                { label: 'Углеводы', value: targetMacros.carbs, color: 'bg-emerald-600' },
              ].map((m) => (
                <div key={m.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-white mb-1">{m.value}г</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-12">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Вода</div>
                <div className="text-lg font-bold text-blue-500">{targetMacros.water} мл</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Шаги</div>
                <div className="text-lg font-bold text-emerald-500">{targetMacros.steps}</div>
              </div>
            </div>

            <button
              onClick={() => onComplete(profile, targetMacros)}
              className="w-full py-5 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
            >
              Начать работу
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-12">
        {step > 0 && step < 8 ? (
          <button onClick={prevStep} className="p-2 -ml-2 text-zinc-600 hover:text-zinc-400 transition-colors">
            <ChevronLeft size={20} />
          </button>
        ) : <div className="w-9 h-9" />}
        
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-6 bg-blue-600' : 'w-1.5 bg-zinc-800'}`}
            />
          ))}
        </div>
        
        <div className="w-9 h-9" />
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
              {step === 8 ? `Добро пожаловать, ${profile.name}` : steps[step].title}
            </h1>
            {step === 0 && <p className="text-zinc-500 text-sm">Давайте создадим ваш профиль</p>}
            
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {(step === 0 || (step > 2 && step < 7)) && (
        <button
          onClick={nextStep}
          disabled={step === 0 && !profile.name.trim()}
          className={`mt-12 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            (step === 0 && !profile.name.trim()) 
              ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed' 
              : 'bg-white text-zinc-950 hover:bg-zinc-200'
          }`}
        >
          Продолжить <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
