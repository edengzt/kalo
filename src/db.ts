import { foods, templates } from "./seeds";
import type { Food, MealLogEntry, MealTemplate, Measurement, Settings } from "./types";

const stores = ["foods", "logs", "templates", "measurements", "settings"] as const;
type Store = typeof stores[number];

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("kalo-db", 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      stores.forEach((store) => database.createObjectStore(store, { keyPath: "id" }));
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transact<T>(store: Store, mode: IDBTransactionMode, action: (objectStore: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(store, mode);
    const request = action(transaction.objectStore(store));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export const getAll = <T,>(store: Store) => transact<T[]>(store, "readonly", (objectStore) => objectStore.getAll());
export const put = <T,>(store: Store, value: T) => transact<IDBValidKey>(store, "readwrite", (objectStore) => objectStore.put(value));
export const remove = (store: Store, id: string) => transact<undefined>(store, "readwrite", (objectStore) => objectStore.delete(id));

export async function setup() {
  if ((await getAll<Food>("foods")).length === 0) {
    for (const food of foods) await put("foods", food);
    for (const template of templates) await put("templates", template);
  }
  const settings = await transact<Settings | undefined>("settings", "readonly", (store) => store.get("settings"));
  if (!settings) await put("settings", { id: "settings", preferredUnits: "imperial", dailyGoals: { calories: 1900, protein: 130, carbs: 180, fat: 60, effectiveDate: "2026-01-01" }, displayPreferences: { showFiber: false } } satisfies Settings);
}

export interface Backup {
  version: 1;
  foods: Food[];
  logs: MealLogEntry[];
  templates: MealTemplate[];
  measurements: Measurement[];
  settings: Settings[];
}

export async function backup(): Promise<Backup> {
  return { version: 1, foods: await getAll("foods"), logs: await getAll("logs"), templates: await getAll("templates"), measurements: await getAll("measurements"), settings: await getAll("settings") };
}

export async function restore(data: unknown) {
  const candidate = data as Partial<Backup>;
  if (candidate.version !== 1 || !Array.isArray(candidate.foods) || !Array.isArray(candidate.logs) || !Array.isArray(candidate.settings)) throw new Error("This file is not a valid Kalo backup.");
  for (const store of stores) {
    const values = candidate[store as keyof Backup];
    if (Array.isArray(values)) for (const value of values) await put(store, value);
  }
}
