import { useMemo, useState } from "react";
import { backup, restore } from "./db";
import { rounded, total } from "./calculations";
import { today, uid } from "./types";
import type { Goals, MealLogEntry, Measurement, Settings } from "./types";

export function HistoryView({ logs, measurements, goals, saveMeasurement }: { logs: MealLogEntry[]; measurements: Measurement[]; goals: Goals; saveMeasurement: (item: Measurement) => Promise<void> }) {
  const [weight, setWeight] = useState("");
  const days = useMemo(() => Object.entries(logs.reduce<Record<string, MealLogEntry[]>>((all, entry) => { (all[entry.date] ||= []).push(entry); return all; }, {})).sort(([a], [b]) => b.localeCompare(a)), [logs]);
  const recent = days.slice(0, 7).map(([, entries]) => total(entries.map(entry => entry.nutritionSnapshot)));
  const average = recent.length ? total(recent).calories / recent.length : 0;
  return <><section className="card"><h2>Weekly average</h2><b>{rounded(average)} kcal/day</b><p className="muted">Based on your latest {recent.length} logged days.</p></section><section className="card"><h2>Progress check-in</h2><p className="muted">Weight is an indirect progress indicator, not a measurement of visceral fat.</p><label>Weight (lb)<input type="number" value={weight} onChange={event => setWeight(event.target.value)} /></label><button className="secondary" onClick={() => { const value = Number(weight); if (value > 0) { saveMeasurement({ id: uid(), date: today(), weight: value }); setWeight(""); } }}>Save weight</button>{measurements.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(item => <p key={item.id}>{item.date}: <b>{item.weight} lb</b></p>)}</section><div className="list">{days.map(([date, entries]) => { const values = total(entries.map(entry => entry.nutritionSnapshot)); return <article className="history" key={date}><b>{date}</b><span>{rounded(values.calories)} / {goals.calories} kcal</span><small>P {rounded(values.protein)}g · C {rounded(values.carbs)}g · F {rounded(values.fat)}g</small></article>; })}</div></>;
}

export function SettingsView({ settings, logs, save }: { settings: Settings; logs: MealLogEntry[]; save: (settings: Settings) => Promise<void> }) {
  const [draft, setDraft] = useState(settings);
  const updateGoal = (key: keyof Goals, value: string) => setDraft(current => ({ ...current, dailyGoals: { ...current.dailyGoals, [key]: Number(value) } }));
  const download = (name: string, text: string, type: string) => { const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(new Blob([text], { type })); anchor.download = name; anchor.click(); URL.revokeObjectURL(anchor.href); };
  return <><section className="card"><h2>Daily targets</h2><div className="form two">{(["calories", "protein", "carbs", "fat"] as const).map(key => <label key={key}>{key}<input type="number" min="0" value={draft.dailyGoals[key]} onChange={event => updateGoal(key, event.target.value)} /></label>)}</div><button className="primary" onClick={() => save({ ...draft, dailyGoals: { ...draft.dailyGoals, effectiveDate: today() } })}>Save targets</button></section><section className="card"><h2>Data portability</h2><button className="secondary" onClick={async () => download("kalo-backup.json", JSON.stringify(await backup(), null, 2), "application/json")}>Export JSON backup</button><button className="secondary" onClick={() => download("kalo-logs.csv", ["date,meal,food,calories", ...logs.map(log => `${log.date},${log.mealType},"${log.foodNameSnapshot}",${log.nutritionSnapshot.calories}`)].join("\n"), "text/csv")}>Export CSV</button><label className="upload">Import JSON<input type="file" accept="application/json" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; try { await restore(JSON.parse(await file.text())); location.reload(); } catch { alert("That is not a valid Kalo backup."); } }} /></label></section></>;
}
