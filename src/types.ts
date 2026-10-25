export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
export type Unit = 'g' | 'oz' | 'serving' | 'packet' | 'scoop' | 'bar' | 'cup';
export interface Nutrition { calories:number; protein:number; carbs:number; fat:number; fiber?:number; sugar?:number; sodium?:number }
export interface Food extends Nutrition { id:string; name:string; brand?:string; category:string; servingSize:number; servingUnit:Unit; servingGrams?:number; preparationState?:string; sourceType:'reference'|'label'; createdAt:string; updatedAt:string; archivedAt?:string }
export interface MealLogEntry { id:string; date:string; mealType:MealType; foodId:string; foodNameSnapshot:string; brandSnapshot?:string; quantity:number; quantityUnit:Unit; gramsConsumed?:number; nutritionSnapshot:Nutrition; createdAt:string; updatedAt:string }
export interface TemplateIngredient { foodId:string; quantity:number; quantityUnit:Unit }
export interface MealTemplate { id:string; name:string; description?:string; ingredients:TemplateIngredient[]; createdAt:string; updatedAt:string }
export interface Goals extends Nutrition { effectiveDate:string }
export interface Measurement { id:string; date:string; weight:number; waistCircumference?:number; notes?:string }
export interface Settings { id:'settings'; preferredUnits:'imperial'|'metric'; dailyGoals:Goals; displayPreferences:{showFiber:boolean} }
export const meals:MealType[]=['Breakfast','Lunch','Dinner','Snacks'];
export const uid=()=>crypto.randomUUID();
export const today=()=>new Date().toLocaleDateString('en-CA');
