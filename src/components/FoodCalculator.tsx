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
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-zinc-900 w-full max-w-md rounded-t-[32px] p-8 pb-10 border-t border-zinc-800 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white font-display mb-1">{food.name}</h2>
            <p className="text-zinc-500">{food.brand || 'Общий продукт'}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 mb-8">
          <button 
            onClick={() => setAmount(Math.max(0, amount - 10))}
            className="w-12 h-12 rounded-full border-2 border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-800 transition-colors"
          >
            <Minus size={24} />
          </button>
          <div className="text-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="text-5xl font-bold text-blue-500 w-32 text-center focus:outline-none font-display bg-transparent"
            />
            <div className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Граммов</div>
          </div>
          <button 
            onClick={() => setAmount(amount + 10)}
            className="w-12 h-12 rounded-full border-2 border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-800 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Ккал', value: currentCalories, color: 'text-white' },
            { label: 'Белки', value: currentProtein, color: 'text-blue-500' },
            { label: 'Жиры', value: currentFat, color: 'text-amber-500' },
            { label: 'Углеводы', value: currentCarbs, color: 'text-emerald-500' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold">{item.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onAdd(amount)}
          className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-emerald-900/50 hover:bg-emerald-700 transition-colors"
        >
          Добавить в {mealName}
        </button>
      </motion.div>
    </div>
  );
}
