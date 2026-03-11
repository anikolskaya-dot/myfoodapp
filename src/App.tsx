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
      <div className="bg-zinc-950 px-6 pt-6 flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="p-2 text-zinc-500 hover:text-zinc-300">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2 font-bold text-white">
          <Calendar size={18} className="text-blue-500" />
          {selectedDate === getTodayDate() ? 'Сегодня' : new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
        </div>
        <button onClick={() => changeDate(1)} className="p-2 text-zinc-500 hover:text-zinc-300">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="bg-zinc-950 p-6 rounded-b-[40px] shadow-sm mb-6 flex flex-col items-center">
        <ProgressRing 
          remaining={Math.round(targetMacros.calories - totals.calories)} 
          total={targetMacros.calories} 
        />
        
        <div className="w-full mt-8 space-y-4">
          {[
            { label: 'Белки', current: totals.protein, target: targetMacros.protein, color: 'bg-blue-600', icon: '🟦' },
            { label: 'Жиры', current: totals.fat, target: targetMacros.fat, color: 'bg-amber-500', icon: '🟨' },
            { label: 'Углеводы', current: totals.carbs, target: targetMacros.carbs, color: 'bg-emerald-600', icon: '🟩' },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5">
                <span className="text-zinc-500">{m.icon} {m.label}</span>
                <span className="text-white">{Math.round(m.current)} / {m.target} г</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}
                  className={`h-full ${m.color}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="w-full mt-8 grid grid-cols-2 gap-4">
          <div className="bg-blue-900/20 rounded-2xl p-4 flex items-center gap-3 border border-blue-900/30">
            <div className="p-2 bg-blue-900/40 text-blue-400 rounded-xl">
              <Droplets size={20} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold">Вода</div>
              <div className="text-sm font-bold text-white">{targetMacros.water} мл</div>
            </div>
          </div>
          <div className="bg-emerald-900/20 rounded-2xl p-4 flex items-center gap-3 border border-emerald-900/30">
            <div className="p-2 bg-emerald-900/40 text-emerald-400 rounded-xl">
              <Footprints size={20} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold">Шаги</div>
              <div className="text-sm font-bold text-white">{targetMacros.steps}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {(Object.keys(MEAL_LABELS) as MealType[]).map((mealType) => (
          <div key={mealType} className="bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white font-display">{MEAL_LABELS[mealType]}</h3>
              <button 
                onClick={() => setIsSearching({ meal: mealType })}
                className="flex items-center gap-1 text-blue-400 font-bold text-sm bg-blue-900/30 px-3 py-1.5 rounded-full"
              >
                <Plus size={16} /> Добавить
              </button>
            </div>
            
            <div className="space-y-3">
              {currentLog.meals[mealType].length > 0 ? (
                currentLog.meals[mealType].map((food) => (
                  <div key={food.logId} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-lg">
                      {food.image ? <img src={food.image} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" /> : '🍎'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate text-sm">{food.name}</div>
                      <div className="text-xs text-zinc-500">{food.amount}г — {Math.round((food.caloriesPer100g * food.amount) / 100)} Ккал</div>
                    </div>
                    <button 
                      onClick={() => removeFood(mealType, food.logId)}
                      className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-zinc-700 text-sm italic py-2">Список пуст</p>
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
        <h1 className="text-3xl font-bold text-white mb-6 font-display">Статистика</h1>
        
        <div className="bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-800 mb-6">
          <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-6">Калории за неделю</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#18181b' }}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                  {last7Days.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.calories > entry.target ? '#ef4444' : '#3b82f6'} 
                      onClick={() => { setSelectedDate(entry.date); setActiveTab('diary'); }}
                      className="cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-4 px-2">История записей</h3>
        <div className="space-y-3">
          {Object.keys(logs).sort((a, b) => b.localeCompare(a)).slice(0, 10).map(date => {
            const log = logs[date];
            const totalCals = (Object.values(log.meals).flat() as LoggedFood[]).reduce((sum: number, f: LoggedFood) => sum + (f.caloriesPer100g * f.amount) / 100, 0);
            return (
              <button 
                key={date}
                onClick={() => { setSelectedDate(date); setActiveTab('diary'); }}
                className="w-full flex items-center justify-between p-4 bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 hover:border-blue-900/50 transition-colors"
              >
                <div className="text-left">
                  <div className="font-bold text-white">{new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
                  <div className="text-xs text-zinc-500">{date === getTodayDate() ? 'Сегодня' : ''}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${totalCals > targetMacros.calories ? 'text-red-500' : 'text-blue-500'}`}>{Math.round(totalCals)} Ккал</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Итого</div>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white font-display">Профиль</h1>
        <button onClick={() => setIsEditingProfile(!isEditingProfile)} className={`p-2 rounded-full transition-colors ${isEditingProfile ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
          <Settings size={20} />
        </button>
      </div>

      <div className="bg-zinc-900 p-8 rounded-[40px] shadow-sm border border-zinc-800 flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-4xl mb-4 border border-zinc-700">
            {profile?.emoji}
          </div>
          {isEditingProfile && (
            <div className="absolute inset-0 flex flex-wrap gap-1 bg-zinc-900/95 backdrop-blur rounded-full p-2 overflow-y-auto no-scrollbar border border-zinc-700">
              {['👤', '🦁', '🦊', '🐼', '🐨', '🐯', '🐸', '🦄', '🥑', '🍎', '💪', '🏃', '🧘'].map(e => (
                <button key={e} onClick={() => updateProfile({ emoji: e })} className="text-xl hover:scale-125 transition-transform">{e}</button>
              ))}
            </div>
          )}
        </div>

        {isEditingProfile ? (
          <input 
            type="text" 
            value={profile?.name} 
            onChange={(e) => updateProfile({ name: e.target.value })}
            className="text-xl font-bold text-white mb-1 text-center bg-zinc-800 rounded-lg px-2 py-1 border-2 border-blue-900/50 focus:outline-none focus:border-blue-500"
          />
        ) : (
          <h2 className="text-xl font-bold text-white mb-1">{profile?.name}</h2>
        )}
        
        <p className="text-zinc-500 text-sm mb-6">{profile?.age} лет • {profile?.height} см • {profile?.weight} кг</p>
        
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-zinc-800/50 rounded-2xl border border-zinc-800">
            <div className="text-blue-500 font-bold text-lg">{targetMacros?.calories}</div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Цель Ккал</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-zinc-800/50 rounded-2xl border border-zinc-800">
            <div className="text-emerald-500 font-bold text-lg">
              {profile?.goal === 'lose' ? 'Похудение' : profile?.goal === 'gain' ? 'Набор' : 'Поддержание'}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Текущая цель</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => setProfile(null)}
          className="w-full flex items-center justify-between p-5 bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg"><Edit2 size={20} /></div>
            <span className="font-semibold text-zinc-300">Пересчитать норму</span>
          </div>
          <ChevronRight size={20} className="text-zinc-700" />
        </button>
        
        <button 
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center justify-between p-5 bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 text-red-500"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/30 text-red-500 rounded-lg"><LogOut size={20} /></div>
            <span className="font-semibold">Сбросить все данные</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto relative font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'diary' && renderDiary()}
          {activeTab === 'stats' && renderStats()}
          {activeTab === 'profile' && renderProfile()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-8 py-4 flex justify-between items-center z-40 max-w-md mx-auto">
        {[
          { id: 'diary', icon: Home, label: 'Дневник' },
          { id: 'stats', icon: BarChart2, label: 'Статистика' },
          { id: 'profile', icon: User, label: 'Профиль' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
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
