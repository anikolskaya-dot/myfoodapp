import { useState, useEffect } from 'react';
import { Search, X, Loader2, Plus } from 'lucide-react';
import { FoodItem, MealType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface FoodSearchProps {
  onClose: () => void;
  onSelect: (food: FoodItem) => void;
}

export default function FoodSearch({ onClose, onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        searchFood();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const searchFood = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Using Open Food Facts API with better parameters
      // sort_by=unique_scans_n brings popular products to the top
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          query
        )}&search_simple=1&action=process&json=1&page_size=24&sort_by=unique_scans_n`
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      if (!data.products) {
        setResults([]);
        return;
      }

      const formattedResults: FoodItem[] = data.products
        .filter((p: any) => p.product_name)
        .map((p: any) => {
          const n = p.nutriments || {};
          
          // Energy handling: prefer kcal, then convert kJ if needed
          let calories = n['energy-kcal_100g'] || n['energy-kcal'] || 0;
          if (!calories && n.energy_100g) {
            // Convert kJ to kcal (1 kJ = 0.239 kcal)
            calories = n.energy_100g * 0.239;
          }

          return {
            id: p._id || Math.random().toString(36).substr(2, 9),
            name: p.product_name,
            brand: p.brands || p.brands_tags?.[0] || '',
            image: p.image_front_small_url || p.image_small_url || p.image_url,
            caloriesPer100g: Math.round(calories),
            proteinPer100g: parseFloat(n.proteins_100g || n.proteins || 0),
            fatPer100g: parseFloat(n.fat_100g || n.fat || 0),
            carbsPer100g: parseFloat(n.carbohydrates_100g || n.carbohydrates || 0),
          };
        });
      
      // Filter out items with 0 calories unless they are explicitly water or similar
      const filteredResults = formattedResults.filter(f => f.caloriesPer100g > 0 || f.name.toLowerCase().includes('вода') || f.name.toLowerCase().includes('water'));
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to a small local set if API is down or blocked
      if (query.toLowerCase().includes('яблоко')) {
        setResults([{
          id: 'fallback-apple',
          name: 'Яблоко (Свежее)',
          brand: 'Натуральный продукт',
          caloriesPer100g: 52,
          proteinPer100g: 0.3,
          fatPer100g: 0.2,
          carbsPer100g: 14,
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col">
      <div className="p-4 border-b border-zinc-900 flex items-center gap-4">
        <button onClick={onClose} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-300">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            autoFocus
            type="text"
            placeholder="Поиск продуктов..."
            className="w-full bg-zinc-900 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-800"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Ищем в базе Open Food Facts...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {results.map((food) => (
              <button
                key={food.id}
                onClick={() => onSelect(food)}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900 transition-colors text-left border border-transparent hover:border-zinc-800"
              >
                <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-700">
                  {food.image ? (
                    <img src={food.image} alt={food.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xl">🍎</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{food.name}</h3>
                  <p className="text-xs text-zinc-500 truncate">{food.brand || 'Общий продукт'}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{food.caloriesPer100g}</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Ккал/100г</div>
                </div>
              </button>
            ))}
          </div>
        ) : query.length > 2 ? (
          <div className="text-center py-20 text-zinc-500">
            <p>Ничего не найдено</p>
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg font-medium mb-2 text-zinc-300">Начни вводить название</p>
            <p className="text-sm">Например: Яблоко, Творог, Big Mac</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { ChevronLeft } from 'lucide-react';
