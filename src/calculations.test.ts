import {
  describe,it,expect
}
from 'vitest';
import {
  nutritionFor,total
}
from './calculations';
import type {
  Food
}
from './types';
const food:Food={
  id:'x',name:'Test',category:'Other',servingSize:100,servingUnit:'g',servingGrams:100,calories:200,protein:20,carbs:10,fat:5,sourceType:'reference',createdAt:'',updatedAt:''
};
describe('nutrition calculations',()=>{
  it('scales a gram food precisely',()=>expect(nutritionFor(food,150,'g')).toMatchObject({
    calories:300,protein:30,carbs:15,fat:7.5
  }));
  it('handles decimal servings',()=>{
    const bar={
      ...food,servingSize:1,servingUnit:'bar' as const,servingGrams:undefined,protein:20
    };
    expect(nutritionFor(bar,.5,'bar').protein).toBe(10)
  });
  it('rejects negative quantities',()=>expect(nutritionFor(food,-1,'g').calories).toBe(0));
  it('totals nutrients',()=>expect(total([food,food]).calories).toBe(400));
});
