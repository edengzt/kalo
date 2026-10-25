import type { Food, Nutrition, Unit } from './types';
export const blankNutrition=():Nutrition=>({calories:0,protein:0,carbs:0,fat:0});
export function nutritionFor(food:Food, quantity:number, unit:Unit):Nutrition {
  if (!Number.isFinite(quantity)||quantity<0) return blankNutrition();
  const isWeight=unit==='g'||unit==='oz';
  if(isWeight&&!food.servingGrams) return blankNutrition();
  const grams=unit==='g'?quantity:unit==='oz'?quantity*28.3495:quantity*(food.servingGrams||food.servingSize);
  const base=food.servingGrams || food.servingSize;
  const factor=base>0 ? grams/base : 0;
  return {calories:food.calories*factor,protein:food.protein*factor,carbs:food.carbs*factor,fat:food.fat*factor,fiber:(food.fiber||0)*factor,sugar:(food.sugar||0)*factor,sodium:(food.sodium||0)*factor};
}
export function total(items:Nutrition[]):Nutrition { return items.reduce((a,b)=>({calories:a.calories+b.calories,protein:a.protein+b.protein,carbs:a.carbs+b.carbs,fat:a.fat+b.fat,fiber:(a.fiber||0)+(b.fiber||0),sugar:(a.sugar||0)+(b.sugar||0),sodium:(a.sodium||0)+(b.sodium||0)}),blankNutrition()); }
export const rounded=(value:number)=>Math.round(value*10)/10;
