import type {
  Food, MealLogEntry, MealTemplate, Measurement, Settings
}
from './types';
import {
  foods, templates
}
from './seeds';
const stores=['foods','logs','templates','measurements','settings'] as const;
type Store=typeof stores[number];
const open=()=>new Promise<IDBDatabase>((resolve,reject)=>{
  const req=indexedDB.open('kalo-db',1);
  req.onupgradeneeded=()=>{
    const db=req.result;
    stores.forEach(s=>db.createObjectStore(s,{
      keyPath:'id'
    }));
  };
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error);
});
async function transaction<T>(store:Store,mode:IDBTransactionMode,action:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{
  const db=await open();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,mode);
    const req=action(tx.objectStore(store));
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
    tx.oncomplete=()=>db.close();
  });
}
export const getAll=<T,>(store:Store)=>transaction<T[]>(store,'readonly',s=>s.getAll());
export const put=<T,>(store:Store,value:T)=>transaction<IDBValidKey>(store,'readwrite',s=>s.put(value));
export const remove=(store:Store,id:string)=>transaction<undefined>(store,'readwrite',s=>s.delete(id));
export async function setup(){
  if((await getAll<Food>('foods')).length===0){
    for(const food of foods)await put('foods',food);
    for(const template of templates)await put('templates',template);
  }
  if(!(await transaction<Settings|undefined>('settings','readonly',s=>s.get('settings')))){
    await put('settings',{
      id:'settings',preferredUnits:'imperial',dailyGoals:{
        calories:1900,protein:130,carbs:180,fat:60,effectiveDate:'2026-01-01'
      },displayPreferences:{
        showFiber:false
      }
    } satisfies Settings);
  }
}
export interface Backup {
  version:1;
  foods:Food[];
  logs:MealLogEntry[];
  templates:MealTemplate[];
  measurements:Measurement[];
  settings:Settings[]
}
export async function backup():Promise<Backup>{
  return {
    version:1,foods:await getAll('foods'),logs:await getAll('logs'),templates:await getAll('templates'),measurements:await getAll('measurements'),settings:await getAll('settings')
  }
}
export async function restore(data:unknown){
  const b=data as Partial<Backup>;
  if(b.version!==1||!Array.isArray(b.foods)||!Array.isArray(b.logs)||!Array.isArray(b.settings))throw new Error('This file is not a valid Kalo backup.');
  for(const store of stores){
    if(Array.isArray(b[store as keyof Backup]))for(const value of b[store as keyof Backup] as unknown[])await put(store,value);
  }
}
export type {
  Food, MealLogEntry, MealTemplate, Measurement, Settings
};
