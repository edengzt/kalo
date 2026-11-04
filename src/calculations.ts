import type { Food, Nutrition, Unit } from "./types";

export const blankNutrition = (): Nutrition => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

export function nutritionFor(food: Food, quantity: number, unit: Unit): Nutrition {
  if (!Number.isFinite(quantity) || quantity < 0) return blankNutrition();

  const isWeightUnit = unit === "g" || unit === "oz";
  if (isWeightUnit && !food.servingGrams) return blankNutrition();

  const grams = unit === "g" ? quantity : unit === "oz" ? quantity * 28.3495 : quantity * (food.servingGrams || food.servingSize);
  const referenceGrams = food.servingGrams || food.servingSize;
  const multiplier = referenceGrams > 0 ? grams / referenceGrams : 0;

  return {
    calories: food.calories * multiplier,
    protein: food.protein * multiplier,
    carbs: food.carbs * multiplier,
    fat: food.fat * multiplier,
    fiber: (food.fiber || 0) * multiplier,
    sugar: (food.sugar || 0) * multiplier,
    sodium: (food.sodium || 0) * multiplier,
  };
}

export function total(items: Nutrition[]): Nutrition {
  return items.reduce((sum, item) => ({
    calories: sum.calories + item.calories,
    protein: sum.protein + item.protein,
    carbs: sum.carbs + item.carbs,
    fat: sum.fat + item.fat,
    fiber: (sum.fiber || 0) + (item.fiber || 0),
    sugar: (sum.sugar || 0) + (item.sugar || 0),
    sodium: (sum.sodium || 0) + (item.sodium || 0),
  }), blankNutrition());
}

export const rounded = (value: number) => Math.round(value * 10) / 10;
