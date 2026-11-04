import { useEffect, useState } from "react";
import { getAll, put, remove, setup } from "./db";
import { nutritionFor, rounded, total } from "./calculations";
import { MealsView } from "./MealsView";
import { HistoryView, SettingsView } from "./UtilityViews";
import { meals, today, uid } from "./types";
import type {
  Food,
  Goals,
  MealLogEntry,
  MealTemplate,
  MealType,
  Measurement,
  Nutrition,
  Settings,
} from "./types";
import "./features.css";

type Page = "Today" | "Foods" | "Meals" | "History" | "Settings";

const stamp = () => new Date().toISOString();
const fallbackGoals: Goals = {
  calories: 1900,
  protein: 130,
  carbs: 180,
  fat: 60,
  effectiveDate: today(),
};

interface MacroProps {
  label: string;
  value: number;
  goal: number;
}

function Macro({ label, value, goal }: MacroProps) {
  return (
    <div className="metric">
      <span>{label}</span>
      <b>{rounded(value)}g</b>
      <small>of {goal}g</small>
      <div className="bar">
        <i style={{ width: `${Math.min(100, (value / goal) * 100)}%` }} />
      </div>
    </div>
  );
}

interface TodayProps {
  date: string;
  setDate: (value: string) => void;
  logs: MealLogEntry[];
  totals: Nutrition;
  goals: Goals;
  removeLog: (id: string) => void;
}

function Today({ date, setDate, logs, totals, goals, removeLog }: TodayProps) {
  const remaining = goals.calories - totals.calories;

  return (
    <>
      <div className="datebar">
        <button onClick={() => setDate(today())}>Today</button>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </div>

      <section className="hero">
        <span>{remaining >= 0 ? "Calories remaining" : "Over daily target"}</span>
        <strong>{rounded(Math.abs(remaining))}</strong>
        <small>{rounded(totals.calories)} of {goals.calories} kcal</small>
      </section>

      <section className="metrics">
        <Macro label="Protein" value={totals.protein} goal={goals.protein} />
        <Macro label="Carbs" value={totals.carbs} goal={goals.carbs} />
        <Macro label="Fat" value={totals.fat} goal={goals.fat} />
      </section>

      {meals.map((meal) => {
        const mealLogs = logs.filter((log) => log.mealType === meal);
        const mealCalories = total(mealLogs.map((log) => log.nutritionSnapshot)).calories;

        return (
          <section className="meal" key={meal}>
            <h2>{meal}<span>{rounded(mealCalories)} kcal</span></h2>
            {mealLogs.map((log) => (
              <article className="entry" key={log.id}>
                <div>
                  <b>{log.foodNameSnapshot}</b>
                  <small>
                    {log.quantity} {log.quantityUnit} · P {rounded(log.nutritionSnapshot.protein)}g · C {rounded(log.nutritionSnapshot.carbs)}g · F {rounded(log.nutritionSnapshot.fat)}g
                  </small>
                </div>
                <button aria-label={`Remove ${log.foodNameSnapshot}`} onClick={() => removeLog(log.id)}>×</button>
              </article>
            ))}
          </section>
        );
      })}
    </>
  );
}

function Foods({ foods, edit }: { foods: Food[]; edit: (food: Food) => void }) {
  const [query, setQuery] = useState("");
  const visible = foods.filter((food) => !food.archivedAt && `${food.name} ${food.brand || ""}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <input className="search" placeholder="Search foods" value={query} onChange={(event) => setQuery(event.target.value)} />
      {visible.map((food) => (
        <article className="food" key={food.id}>
          <button className="foodmain" onClick={() => edit(food)}>
            <b>{food.name}</b>
            <small>{food.brand || food.category} · {food.preparationState || ""}</small>
            <span>{food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g per {food.servingSize} {food.servingUnit}</span>
          </button>
        </article>
      ))}
    </>
  );
}

function FoodModal({ food, close, save }: { food: Food; close: () => void; save: (food: Food) => void }) {
  const [draft, setDraft] = useState(food);
  const update = (key: keyof Food, value: string) => {
    const numericFields = ["servingSize", "calories", "protein", "carbs", "fat"];
    setDraft((current) => ({ ...current, [key]: numericFields.includes(key) ? Number(value) : value }));
  };
  const submit = () => {
    if (!draft.name || draft.servingSize <= 0) return alert("Enter a name and valid serving size.");
    save({ ...draft, updatedAt: stamp() });
  };

  return (
    <div className="modal">
      <section className="sheet">
        <header><h2>{food.name ? "Edit food" : "New food"}</h2><button onClick={close}>×</button></header>
        <div className="form two">
          <label>Name<input autoFocus value={draft.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label>Brand<input value={draft.brand || ""} onChange={(event) => update("brand", event.target.value)} /></label>
          <label>Category<input value={draft.category} onChange={(event) => update("category", event.target.value)} /></label>
          <label>Serving size<input type="number" min="0" value={draft.servingSize} onChange={(event) => update("servingSize", event.target.value)} /></label>
          <label>Unit<select value={draft.servingUnit} onChange={(event) => update("servingUnit", event.target.value)}>{["g", "serving", "scoop", "bar", "cup"].map((unit) => <option key={unit}>{unit}</option>)}</select></label>
          <label>Calories<input type="number" min="0" value={draft.calories} onChange={(event) => update("calories", event.target.value)} /></label>
          <label>Protein (g)<input type="number" min="0" value={draft.protein} onChange={(event) => update("protein", event.target.value)} /></label>
          <label>Carbs (g)<input type="number" min="0" value={draft.carbs} onChange={(event) => update("carbs", event.target.value)} /></label>
          <label>Fat (g)<input type="number" min="0" value={draft.fat} onChange={(event) => update("fat", event.target.value)} /></label>
        </div>
        <button className="primary wide" onClick={submit}>Save food</button>
      </section>
    </div>
  );
}

function LogModal({ foods, date, close, save }: { foods: Food[]; date: string; close: () => void; save: (log: MealLogEntry) => void }) {
  const [food, setFood] = useState<Food>();
  const [meal, setMeal] = useState<MealType>("Lunch");
  const [quantity, setQuantity] = useState(1);
  const submit = () => {
    if (!food || quantity <= 0) return;
    save({ id: uid(), date, mealType: meal, foodId: food.id, foodNameSnapshot: food.name, quantity, quantityUnit: food.servingUnit, nutritionSnapshot: nutritionFor(food, quantity, food.servingUnit), createdAt: stamp(), updatedAt: stamp() });
  };

  return <div className="modal"><section className="sheet"><header><h2>Add food</h2><button onClick={close}>×</button></header><label>Food<select value={food?.id || ""} onChange={(event) => setFood(foods.find((item) => item.id === event.target.value))}><option value="">Select a food</option>{foods.filter((item) => !item.archivedAt).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Meal<select value={meal} onChange={(event) => setMeal(event.target.value as MealType)}>{meals.map((item) => <option key={item}>{item}</option>)}</select></label><label>Quantity<input type="number" min="0.01" step="any" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label><button className="primary wide" onClick={submit}>Add food</button></section></div>;
}

export default function App() {
  const [page, setPage] = useState<Page>("Today");
  const [foods, setFoods] = useState<Food[]>([]);
  const [logs, setLogs] = useState<MealLogEntry[]>([]);
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [settings, setSettings] = useState<Settings>();
  const [date, setDate] = useState(today());
  const [editing, setEditing] = useState<Food>();
  const [adding, setAdding] = useState(false);
  const refresh = async () => { await setup(); const [a, b, c, d, e] = await Promise.all([getAll<Food>("foods"), getAll<MealLogEntry>("logs"), getAll<MealTemplate>("templates"), getAll<Measurement>("measurements"), getAll<Settings>("settings")]); setFoods(a); setLogs(b); setTemplates(c); setMeasurements(d); setSettings(e[0]); };

  useEffect(() => { refresh(); }, []);
  if (!settings) return <main className="loading">Loading your offline nutrition journal…</main>;
  const dayLogs = logs.filter((log) => log.date === date);
  const daily = total(dayLogs.map((log) => log.nutritionSnapshot));
  const createFood = (): Food => ({ id: uid(), name: "", category: "Other", servingSize: 1, servingUnit: "serving", calories: 0, protein: 0, carbs: 0, fat: 0, sourceType: "label", createdAt: stamp(), updatedAt: stamp() });

  return <main><header className="top"><div><span className="eyebrow">KALO</span><h1>{page}</h1></div>{page === "Today" && <button className="primary" onClick={() => setAdding(true)}>+ Add food</button>}</header>{page === "Today" && <Today date={date} setDate={setDate} logs={dayLogs} totals={daily} goals={settings.dailyGoals || fallbackGoals} removeLog={async (id) => { await remove("logs", id); refresh(); }} />}{page === "Foods" && <Foods foods={foods} edit={setEditing} />}{page === "Meals" && <MealsView foods={foods} templates={templates} date={date} saveTemplate={async (template) => { await put("templates", template); refresh(); }} logEntries={async (entries) => { for (const entry of entries) await put("logs", entry); refresh(); }} />}{page === "History" && <HistoryView logs={logs} measurements={measurements} goals={settings.dailyGoals} saveMeasurement={async (item) => { await put("measurements", item); refresh(); }} />}{page === "Settings" && <SettingsView settings={settings} logs={logs} save={async (item) => { await put("settings", item); setSettings(item); }} />}<nav>{(["Today", "Foods", "Meals", "History", "Settings"] as Page[]).map((item) => <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>{item}</button>)}</nav>{page === "Foods" && <button className="fab" onClick={() => setEditing(createFood())}>+ New food</button>}{editing && <FoodModal food={editing} close={() => setEditing(undefined)} save={async (food) => { await put("foods", food); setEditing(undefined); refresh(); }} />}{adding && <LogModal foods={foods} date={date} close={() => setAdding(false)} save={async (log) => { await put("logs", log); setAdding(false); refresh(); }} />}</main>;
}
