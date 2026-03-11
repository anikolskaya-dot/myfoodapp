/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BarChart2, 
  User, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Trash2,
  Settings,
  LogOut,
  Calendar,
  Droplets,
  Footprints,
  Edit2
} from 'lucide-react';
import { UserProfile, Macros, DailyLog, LoggedFood, MealType, MEAL_LABELS, FoodItem } from './types';
import { getTodayDate, calculateMacros } from './utils';
import Onboarding from './components/Onboarding';
import ProgressRing from './components/ProgressRing';
import FoodSearch from './components/FoodSearch';
import FoodCalculator from './components/FoodCalculator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targetMacros, setTargetMacros] = useState<Macros | null>(null);
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [activeTab, setActiveTab] = useState<'diary' | 'stats' | 'profile'>('diary');
  const [isSearching, setIsSearching] = useState<{ meal: MealType } | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('nutri_profile');
    const savedMacros = localStorage.getItem('nutri_macros');
    const savedLogs = localStorage.getItem('nutri_logs');

    if (savedProfile && savedMacros) {
      setProfile(JSON.parse(savedProfile));
      setTargetMacros(JSON.parse(savedMacros));
    }
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (profile) localStorage.setItem('nutri_profile', JSON.stringify(profile));
    if (targetMacros) localStorage.setItem('nutri_macros', JSON.stringify(targetMacros));
    if (Object.keys(logs).length > 0) localStorage.setItem('nutri_logs', JSON.stringify(logs));
  }, [profile, targetMacros, logs]);

  const currentLog = logs[selectedDate] || { date: selectedDate, meals: { breakfast: [], lunch: [], dinner: [], snack: [] } };

  const totals = useMemo(() => {
    const allFoods = Object.values(currentLog.meals).flat();
    return allFoods.reduce((acc: Macros, food: LoggedFood) => ({
      ...acc,
      calories: acc.calories + (food.caloriesPer100g * food.amount) / 100,
      protein: acc.protein + (food.proteinPer100g * food.amount) / 100,
      fat: acc.fat + (food.fatPer100g * food.amount) / 100,
      carbs: acc.carbs + (food.carbsPer100g * food.amount) / 100,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0, water: 0, steps: 0 });
  }, [currentLog]);

  const handleOnboardingComplete = (p: UserProfile, m: Macros) => {
    setProfile(p);
    setTargetMacros(m);
  };

  const addFoodToLog = (amount: number) => {
    if (!selectedFood || !isSearching) return;

    const newLoggedFood: LoggedFood = {
      ...selectedFood,
      logId: Math.random().toString(36).substr(2, 9),
      amount,
      timestamp: Date.now(),
    };

    const updatedLog = {
      ...currentLog,
      meals: {
        ...currentLog.meals,
        [isSearching.meal]: [...currentLog.meals[isSearching.meal], newLoggedFood],
      },
    };

    setLogs({ ...logs, [selectedDate]: updatedLog });
    setSelectedFood(null);
    setIsSearching(null);
  };

  const removeFood = (meal: MealType, logId: string) => {
    const updatedLog = {
      ...currentLog,
      meals: {
        ...currentLog.meals,
        [meal]: currentLog.meals[meal].filter(f => f.logId !== logId),
      },
    };
    setLogs({ ...logs, [selectedDate]: updatedLog });
  };

  const resetApp = () => {
    localStorage.clear();
    window.location.reload();
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    const newMacros = calculateMacros(newProfile);
    setProfile(newProfile);
    setTargetMacros(newMacros);
  };

  if (!isLoaded) return null;

  if (!profile || !targetMacros) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderDiary = () => (
    <div className="pb-24">
      {/* Date Header */}
      <div className="bg-zinc-950 px-6 pt-8 flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2 font-bold text-white tracking-tight">
          <Calendar size={18} className="text-blue-500 opacity-80" />
          {selectedDate === getTodayDate() ? 'Сегодня' : new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
        </div>
        <button onClick={() => changeDate(1)} className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="bg-zinc-950 p-6 rounded-b-3xl shadow-sm mb-6 flex flex-col items-center border-b border-zinc-900">
        <ProgressRing 
          remaining={Math.round(targetMacros.calories - totals.calories)} 
          total={targetMacros.calories} 
        />
        
        <div className="w-full mt-10 space-y-5">
          {[
            { label: 'Белки', current: totals.protein, target: targetMacros.protein, color: 'bg-blue-600', icon: '🟦' },
            { label: 'Жиры', current: totals.fat, target: targetMacros.fat, color: 'bg-amber-600', icon: '🟨' },
            { label: 'Углеводы', current: totals.carbs, target: targetMacros.carbs, color: 'bg-emerald-600', icon: '🟩' },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-zinc-500">{m.label}</span>
                <span className="text-zinc-300">{Math.round(m.current)} / {m.target} г</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}
                  className={`h-full ${m.color} opacity-90`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="w-full mt-10 grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/50 rounded-xl p-4 flex items-center gap-3 border border-zinc-800">
            <div className="p-2 bg-blue-900/20 text-blue-500 rounded-lg">
              <Droplets size={18} />
            </div>
            <div>
              <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Вода</div>
              <div className="text-sm font-bold text-white">{targetMacros.water} мл</div>
            </div>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 flex items-center gap-3 border border-zinc-800">
            <div className="p-2 bg-emerald-900/20 text-emerald-500 rounded-lg">
              <Footprints size={18} />
            </div>
            <div>
              <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Шаги</div>
              <div className="text-sm font-bold text-white">{targetMacros.steps}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {(Object.keys(MEAL_LABELS) as MealType[]).map((mealType) => (
          <div key={mealType} className="bg-zinc-900/30 rounded-2xl p-5 border border-zinc-900">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{MEAL_LABELS[mealType]}</h3>
              <button 
                onClick={() => setIsSearching({ meal: mealType })}
                className="flex items-center gap-1.5 text-blue-500 font-bold text-xs hover:text-blue-400 transition-colors"
              >
                <Plus size={14} /> Добавить
              </button>
            </div>
            
            <div className="space-y-4">
              {currentLog.meals[mealType].length > 0 ? (
                currentLog.meals[mealType].map((food) => (
                  <div key={food.logId} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-lg border border-zinc-800 overflow-hidden">
                      {food.image ? <img src={food.image} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" /> : '🍎'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-200 truncate text-sm">{food.name}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{food.amount}г • {Math.round((food.caloriesPer100g * food.amount) / 100)} Ккал</div>
                    </div>
                    <button 
                      onClick={() => removeFood(mealType, food.logId)}
                      className="p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-zinc-800 text-xs font-medium italic">Нет записей</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const log = logs[dateStr];
      const totalCals = log ? (Object.values(log.meals).flat() as LoggedFood[]).reduce((sum: number, f: LoggedFood) => sum + (f.caloriesPer100g * f.amount) / 100, 0) : 0;
      return {
        name: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
        date: dateStr,
        calories: Math.round(totalCals),
        target: targetMacros?.calories || 2000,
      };
    });

    return (
      <div className="p-6 pb-24">
        <h1 className="text-2xl font-bold text-white mb-8 tracking-tight">Статистика</h1>
        
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 mb-8">
          <h3 className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-8">Активность за неделю</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 700 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#18181b', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', boxShadow: 'none' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                  {last7Days.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.calories > entry.target ? '#ef4444' : '#3b82f6'} 
                      fillOpacity={0.8}
                      onClick={() => { setSelectedDate(entry.date); setActiveTab('diary'); }}
                      className="cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h3 className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-4 px-2">История</h3>
        <div className="space-y-2">
          {Object.keys(logs).sort((a, b) => b.localeCompare(a)).slice(0, 10).map(date => {
            const log = logs[date];
            const totalCals = (Object.values(log.meals).flat() as LoggedFood[]).reduce((sum: number, f: LoggedFood) => sum + (f.caloriesPer100g * f.amount) / 100, 0);
            return (
              <button 
                key={date}
                onClick={() => { setSelectedDate(date); setActiveTab('diary'); }}
                className="w-full flex items-center justify-between p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 hover:border-zinc-700 transition-colors"
              >
                <div className="text-left">
                  <div className="font-bold text-zinc-200 text-sm">{new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{date === getTodayDate() ? 'Сегодня' : ''}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${totalCals > targetMacros.calories ? 'text-red-500' : 'text-blue-500'}`}>{Math.round(totalCals)} Ккал</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">Профиль</h1>
        <button onClick={() => setIsEditingProfile(!isEditingProfile)} className={`p-2 rounded-lg transition-colors ${isEditingProfile ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}>
          <Settings size={18} />
        </button>
      </div>

      <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 flex flex-col items-center mb-8">
        <div className="relative group mb-6">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-3xl border border-zinc-800 shadow-inner">
            {profile?.emoji}
          </div>
          {isEditingProfile && (
            <div className="absolute inset-0 flex flex-wrap gap-1 bg-zinc-950/95 backdrop-blur rounded-full p-2 overflow-y-auto no-scrollbar border border-zinc-800 z-10">
              {['👤', '🦁', '🦊', '🐼', '🐨', '🐯', '🐸', '🦄', '🥑', '🍎', '💪', '🏃', '🧘'].map(e => (
                <button key={e} onClick={() => updateProfile({ emoji: e })} className="text-lg hover:scale-125 transition-transform">{e}</button>
              ))}
            </div>
          )}
        </div>

        {isEditingProfile ? (
          <input 
            type="text" 
            value={profile?.name} 
            onChange={(e) => updateProfile({ name: e.target.value })}
            className="text-lg font-bold text-white mb-2 text-center bg-zinc-950 rounded-lg px-3 py-1.5 border border-zinc-800 focus:outline-none focus:border-blue-500 w-full max-w-[200px]"
          />
        ) : (
          <h2 className="text-xl font-bold text-white mb-1 tracking-tight">{profile?.name}</h2>
        )}
        
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">{profile?.age} лет • {profile?.height} см • {profile?.weight} кг</p>
        
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center p-4 bg-zinc-950/50 rounded-xl border border-zinc-900">
            <div className="text-blue-500 font-bold text-lg tracking-tight">{targetMacros?.calories}</div>
            <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Цель Ккал</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-zinc-950/50 rounded-xl border border-zinc-900">
            <div className="text-emerald-500 font-bold text-sm tracking-tight text-center">
              {profile?.goal === 'lose' ? 'Снижение' : profile?.goal === 'gain' ? 'Набор' : 'Поддержание'}
            </div>
            <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Стратегия</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button 
          onClick={() => setProfile(null)}
          className="w-full flex items-center justify-between p-5 bg-zinc-900/30 rounded-xl border border-zinc-900 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-950 text-zinc-400 rounded-lg"><Edit2 size={18} /></div>
            <span className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Пересчитать параметры</span>
          </div>
          <ChevronRight size={18} className="text-zinc-700" />
        </button>
        
        <button 
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center justify-between p-5 bg-zinc-900/30 rounded-xl border border-zinc-900 hover:border-red-900/30 transition-colors text-red-500/80"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-950 text-red-500/50 rounded-lg"><LogOut size={18} /></div>
            <span className="text-sm font-bold uppercase tracking-wider">Сбросить данные</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto relative font-sans selection:bg-blue-500/30">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'diary' && renderDiary()}
          {activeTab === 'stats' && renderStats()}
          {activeTab === 'profile' && renderProfile()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 px-10 py-5 flex justify-between items-center z-40 max-w-md mx-auto">
        {[
          { id: 'diary', icon: Home, label: 'Дневник' },
          { id: 'stats', icon: BarChart2, label: 'Статистика' },
          { id: 'profile', icon: User, label: 'Профиль' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === tab.id ? 'text-blue-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isSearching && (
          <FoodSearch 
            onClose={() => setIsSearching(null)} 
            onSelect={(food) => setSelectedFood(food)} 
          />
        )}
        {selectedFood && isSearching && (
          <FoodCalculator 
            food={selectedFood} 
            mealName={MEAL_LABELS[isSearching.meal]} 
            onClose={() => setSelectedFood(null)}
            onAdd={addFoodToLog}
          />
        )}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-6 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 w-full max-w-xs rounded-3xl p-6 text-center border border-zinc-800 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Сбросить данные?</h3>
              <p className="text-zinc-500 text-sm mb-6">Это действие удалит весь ваш прогресс и настройки. Это нельзя отменить.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={resetApp}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  Да, сбросить
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
