import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem } from '../types';
import { X, Minus, Plus } from 'lucide-react';

interface FoodCalculatorProps {
  food: FoodItem;
  onClose: () => void;
  onAdd: (amount: number) => void;
  mealName: string;
}

export default function FoodCalculator({ food, onClose, onAdd, mealName }: FoodCalculatorProps) {
  const [amount, setAmount] = useState(100);

  const calculate = (val: number, per100: number) => {
    return Math.round((val * per100) / 100 * 10) / 10;
  };

  const currentCalories = calculate(amount, food.caloriesPer100g);
  const currentProtein = calculate(amount, food.proteinPer100g);
  const currentFat = calculate(amount, food.fatPer100g);
  const currentCarbs = calculate(amount, food.carbsPer100g);

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center p-4">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white w-full max-w-md rounded-t-[32px] p-8 pb-10"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 font-display mb-1">{food.name}</h2>
            <p className="text-slate-500">{food.brand || 'Общий продукт'}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 mb-8">
          <button 
            onClick={() => setAmount(Math.max(0, amount - 10))}
            className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50"
          >
            <Minus size={24} />
          </button>
          <div className="text-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="text-5xl font-bold text-blue-600 w-32 text-center focus:outline-none font-display"
            />
            <div className="text-slate-400 font-bold uppercase text-xs tracking-widest">Граммов</div>
          </div>
          <button 
            onClick={() => setAmount(amount + 10)}
            className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Ккал', value: currentCalories, color: 'text-slate-900' },
            { label: 'Белки', value: currentProtein, color: 'text-blue-500' },
            { label: 'Жиры', value: currentFat, color: 'text-amber-500' },
            { label: 'Углеводы', value: currentCarbs, color: 'text-emerald-500' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">{item.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onAdd(amount)}
          className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold text-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-colors"
        >
          Добавить в {mealName}
        </button>
      </motion.div>
    </div>
  );
}
