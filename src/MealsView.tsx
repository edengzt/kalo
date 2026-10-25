import { useMemo, useState } from "react";
import { nutritionFor, rounded, total } from "./calculations";
import { meals, uid } from "./types";
import type { Food, MealLogEntry, MealTemplate, MealType, TemplateIngredient, Unit } from "./types";

interface Props {
  foods: Food[];
  templates: MealTemplate[];
  date: string;
  saveTemplate: (template: MealTemplate) => Promise<void>;
  logEntries: (entries: MealLogEntry[]) => Promise<void>;
}

interface DraftIngredient extends TemplateIngredient {
  key: string;
}

const stamp = () => new Date().toISOString();

export function MealsView({ foods, templates, date, saveTemplate, logEntries }: Props) {
  const [building, setBuilding] = useState(false);
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>("Dinner");
  const [batchServings, setBatchServings] = useState(1);
  const [logServings, setLogServings] = useState<Record<string, number>>({});
  const [ingredients, setIngredients] = useState<DraftIngredient[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const activeFoods = foods.filter(food => !food.archivedAt);
  const nutrition = useMemo(() => total(ingredients.map(item => {
    const food = foods.find(candidate => candidate.id === item.foodId);
    return food ? nutritionFor(food, item.quantity, item.quantityUnit) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
  })), [foods, ingredients]);

  const addIngredient = () => {
    const food = foods.find(candidate => candidate.id === selectedId);
    if (!food) return;
    setIngredients(current => [...current, { key: uid(), foodId: food.id, quantity: 1, quantityUnit: food.servingUnit }]);
    setSelectedId("");
  };

  const updateIngredient = (key: string, change: Partial<DraftIngredient>) => {
    setIngredients(current => current.map(item => item.key === key ? { ...item, ...change } : item));
  };

  const saveMeal = async () => {
    if (!name.trim() || !ingredients.length || !Number.isFinite(batchServings) || batchServings <= 0) {
      return alert("Give the meal a name, add ingredients, and enter at least one batch portion.");
    }
    await saveTemplate({
      id: uid(),
      name: name.trim(),
      ingredients: ingredients.map(({ foodId, quantity, quantityUnit }) => ({ foodId, quantity, quantityUnit })),
      servings: batchServings,
      createdAt: stamp(),
      updatedAt: stamp(),
    });
    setBuilding(false);
    setName("");
    setBatchServings(1);
    setIngredients([]);
  };

  const logTemplate = async (template: MealTemplate) => {
    const portions = logServings[template.id] || 1;
    const batchServings = template.servings || 1;
    const entries = template.ingredients.flatMap(ingredient => {
      const food = foods.find(candidate => candidate.id === ingredient.foodId);
      if (!food) return [];
      return [{
        id: uid(), date, mealType, foodId: food.id, foodNameSnapshot: food.name,
        brandSnapshot: food.brand,
        quantity: ingredient.quantity * portions / batchServings,
        quantityUnit: ingredient.quantityUnit,
        nutritionSnapshot: nutritionFor(food, ingredient.quantity * portions / batchServings, ingredient.quantityUnit),
        createdAt: stamp(), updatedAt: stamp(),
      } satisfies MealLogEntry];
    });
    if (!entries.length) return alert("This meal has no available catalog foods.");
    await logEntries(entries);
  };

  return <>
    <p className="muted">Build the meals you actually eat from individual foods, then reuse them whenever you want.</p>
    <button className="primary" onClick={() => setBuilding(true)}>+ Create custom meal</button>
    <label className="meal-picker">Log reusable meals to<select value={mealType} onChange={event => setMealType(event.target.value as MealType)}>{meals.map(meal => <option key={meal}>{meal}</option>)}</select></label>
    <div className="list">
      {templates.map(template => {
        const batchServings = template.servings || 1;
        const templateNutrition = total(template.ingredients.map(ingredient => {
          const food = foods.find(candidate => candidate.id === ingredient.foodId);
          return food ? nutritionFor(food, ingredient.quantity / batchServings, ingredient.quantityUnit) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }));
        return <article className="template" key={template.id}><div><b>{template.name}</b><small>{template.ingredients.length} ingredients · makes {batchServings} portions · {rounded(templateNutrition.calories)} kcal each</small></div><div className="template-actions"><label>Portions<input aria-label={`Portions of ${template.name} to log`} type="number" min="0.1" step="any" value={logServings[template.id] || 1} onChange={event => setLogServings(current => ({ ...current, [template.id]: Number(event.target.value) }))} /></label><button className="primary" onClick={() => logTemplate(template)}>Log meal</button></div></article>;
      })}
    </div>
    {building && <div className="modal"><section className="sheet"><header><h2>Create custom meal</h2><button onClick={() => setBuilding(false)}>×</button></header>
      <label>Meal name<input autoFocus placeholder="e.g. Beef mushroom rice bowl" value={name} onChange={event => setName(event.target.value)} /></label>
      <label>How many prepared portions does this batch make?<input type="number" min="1" step="1" value={batchServings} onChange={event => setBatchServings(Number(event.target.value))} /></label>
      <div className="ingredient-add"><select value={selectedId} onChange={event => setSelectedId(event.target.value)}><option value="">Choose an ingredient</option>{activeFoods.map(food => <option key={food.id} value={food.id}>{food.name}</option>)}</select><button className="secondary" onClick={addIngredient}>Add</button></div>
      <div className="ingredient-list">{ingredients.map(ingredient => { const food = foods.find(candidate => candidate.id === ingredient.foodId); if (!food) return null; return <div className="ingredient-row" key={ingredient.key}><span>{food.name}</span><input aria-label={`${food.name} quantity`} type="number" min="0.01" step="any" value={ingredient.quantity} onChange={event => updateIngredient(ingredient.key, { quantity: Number(event.target.value) })} /><select value={ingredient.quantityUnit} onChange={event => updateIngredient(ingredient.key, { quantityUnit: event.target.value as Unit })}><option value={food.servingUnit}>{food.servingUnit}</option>{food.servingGrams && <><option value="g">g</option><option value="oz">oz</option></>}</select><button onClick={() => setIngredients(current => current.filter(item => item.key !== ingredient.key))}>×</button></div>; })}</div>
      <div className="meal-total"><b>{rounded(nutrition.calories / Math.max(1, batchServings))} kcal per portion</b><span>Batch: {rounded(nutrition.calories)} kcal · P {rounded(nutrition.protein / Math.max(1, batchServings))}g · C {rounded(nutrition.carbs / Math.max(1, batchServings))}g · F {rounded(nutrition.fat / Math.max(1, batchServings))}g each</span></div>
      <button className="primary wide" onClick={saveMeal}>Save custom meal</button>
    </section></div>}
  </>;
}
