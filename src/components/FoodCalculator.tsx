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
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-end justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-zinc-950 w-full max-w-md rounded-t-3xl p-8 pb-12 border-t border-zinc-800 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white tracking-tight mb-1">{food.name}</h2>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{food.brand || 'Общий продукт'}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-600 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-10 mb-10">
          <button 
            onClick={() => setAmount(Math.max(0, amount - 10))}
            className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
          >
            <Minus size={20} />
          </button>
          <div className="text-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="text-6xl font-bold text-white w-32 text-center focus:outline-none tracking-tighter bg-transparent"
            />
            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-2">Граммов</div>
          </div>
          <button 
            onClick={() => setAmount(amount + 10)}
            className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-10">
          {[
            { label: 'Ккал', value: currentCalories, color: 'text-white' },
            { label: 'Белки', value: currentProtein, color: 'text-blue-500' },
            { label: 'Жиры', value: currentFat, color: 'text-amber-600' },
            { label: 'Углеводы', value: currentCarbs, color: 'text-emerald-500' },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 bg-zinc-900/30 rounded-xl border border-zinc-900">
              <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onAdd(amount)}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
        >
          Добавить в {mealName}
        </button>
      </motion.div>
    </div>
  );
}
