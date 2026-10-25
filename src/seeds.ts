import type {
  Food, MealTemplate
}
from './types';
const now='2026-01-01T00:00:00.000Z';
const f=(id:string,name:string,category:string,servingSize:number,servingUnit:Food['servingUnit'],calories:number,protein:number,carbs:number,fat:number,preparationState?:string):Food=>({
  id,name,category,servingSize,servingUnit,servingGrams:servingUnit==='g'?servingSize:undefined,calories,protein,carbs,fat,preparationState,sourceType:'reference',createdAt:now,updatedAt:now
});
export const foods:Food[]=[
f('chicken-raw','Chicken breast','Meat & poultry',100,'g',120,22.5,0,2.6,'raw'),f('chicken-cooked','Chicken breast','Meat & poultry',100,'g',165,31,0,3.6,'cooked'),f('beef-90','Ground beef, 90% lean','Meat & poultry',100,'g',176,20,0,10,'cooked'),f('turkey','Ground turkey, 93% lean','Meat & poultry',100,'g',176,22,0,9,'cooked'),f('tuna','Tuna in water, drained','Fish & seafood',85,'g',100,22,0,0.8,'drained'),f('salmon','Salmon','Fish & seafood',100,'g',208,20,0,13,'cooked'),f('egg','Egg, large','Dairy & eggs',1,'serving',72,6.3,0.4,4.8),f('egg-whites','Egg whites','Dairy & eggs',100,'g',52,11,0.7,0.2),f('greek-yogurt','Greek yogurt, nonfat','Dairy & eggs',170,'g',100,17,6,0),f('cottage','Cottage cheese, low-fat','Dairy & eggs',113,'g',90,12,5,2.5),f('whey','Whey protein powder','Protein powders & bars',1,'scoop',120,24,3,1.5),f('protein-bar','Protein bar, reference','Protein powders & bars',1,'bar',200,20,22,7),
f('rice-white-cooked','White rice','Grains & pasta',100,'g',130,2.7,28,0.3,'cooked'),f('rice-white-dry','White rice','Grains & pasta',100,'g',365,7,80,0.7,'dry'),f('rice-brown','Brown rice','Grains & pasta',100,'g',123,2.7,25.6,1,'cooked'),f('pasta-cooked','Pasta','Grains & pasta',100,'g',158,5.8,30.9,0.9,'cooked'),f('pasta-dry','Pasta','Grains & pasta',100,'g',371,13,75,1.5,'dry'),f('oats','Oats','Grains & pasta',40,'g',150,5,27,3),f('bread','Whole wheat bread','Grains & pasta',1,'serving',80,4,14,1),f('tortilla','Flour tortilla','Grains & pasta',1,'serving',140,4,24,4),
f('broccoli','Broccoli','Vegetables',100,'g',35,2.4,7.2,0.4),f('spinach','Spinach','Vegetables',100,'g',23,2.9,3.6,0.4),f('greens','Mixed greens','Vegetables',85,'g',20,2,4,0),f('cucumber','Cucumber','Vegetables',100,'g',15,0.7,3.6,0.1),f('tomato','Tomato','Vegetables',100,'g',18,0.9,3.9,0.2),f('pepper','Bell pepper','Vegetables',100,'g',31,1,6,0.3),f('onion','Onion','Vegetables',100,'g',40,1.1,9.3,0.1),f('mushroom','Mushrooms','Vegetables',100,'g',22,3.1,3.3,0.3),f('green-bean','Green beans','Vegetables',100,'g',31,1.8,7,0.2),f('banana','Banana','Fruit',1,'serving',105,1.3,27,0.4),f('apple','Apple','Fruit',1,'serving',95,0.5,25,0.3),f('strawberry','Strawberries','Fruit',100,'g',32,0.7,7.7,0.3),
f('olive-oil','Olive oil','Sauces & oils',1,'serving',119,0,0,13.5),f('avocado','Avocado','Fats & other',100,'g',160,2,8.5,14.7),f('almonds','Almonds','Fats & other',28,'g',164,6,6,14),f('parmesan','Parmesan','Dairy & eggs',28,'g',111,10,1,7.3),f('marinara','Marinara sauce','Sauces & oils',125,'g',70,2,12,2),f('dressing','Salad dressing','Sauces & oils',2,'serving',130,0,2,14),f('soy','Soy sauce','Sauces & oils',1,'serving',10,1,1,0),f('salsa','Salsa','Sauces & oils',2,'serving',10,0,2,0)
];
const t=(id:string,name:string,ingredients:MealTemplate['ingredients']):MealTemplate=>({
  id,name,ingredients,createdAt:now,updatedAt:now
});
export const templates=[t('tmpl-chicken-salad','Chicken breast salad',[{
  foodId:'chicken-cooked',quantity:150,quantityUnit:'g'
},{
  foodId:'greens',quantity:85,quantityUnit:'g'
},{
  foodId:'tomato',quantity:100,quantityUnit:'g'
},{
  foodId:'dressing',quantity:1,quantityUnit:'serving'
}]),t('tmpl-tuna-salad','Tuna and egg salad',[{
  foodId:'tuna',quantity:1,quantityUnit:'serving'
},{
  foodId:'egg',quantity:2,quantityUnit:'serving'
},{
  foodId:'greens',quantity:85,quantityUnit:'g'
}]),t('tmpl-chicken-rice','Chicken, rice and broccoli',[{
  foodId:'chicken-cooked',quantity:150,quantityUnit:'g'
},{
  foodId:'rice-white-cooked',quantity:150,quantityUnit:'g'
},{
  foodId:'broccoli',quantity:100,quantityUnit:'g'
}]),t('tmpl-stir','Chicken stir-fry with rice',[{
  foodId:'chicken-cooked',quantity:150,quantityUnit:'g'
},{
  foodId:'rice-white-cooked',quantity:150,quantityUnit:'g'
},{
  foodId:'pepper',quantity:100,quantityUnit:'g'
}]),t('tmpl-turkey-pasta','Ground turkey pasta',[{
  foodId:'turkey',quantity:150,quantityUnit:'g'
},{
  foodId:'pasta-cooked',quantity:180,quantityUnit:'g'
},{
  foodId:'marinara',quantity:1,quantityUnit:'serving'
}]),t('tmpl-salmon','Salmon rice bowl',[{
  foodId:'salmon',quantity:150,quantityUnit:'g'
},{
  foodId:'rice-white-cooked',quantity:150,quantityUnit:'g'
},{
  foodId:'cucumber',quantity:100,quantityUnit:'g'
}]),t('tmpl-beef','Lean beef taco rice bowl',[{
  foodId:'beef-90',quantity:150,quantityUnit:'g'
},{
  foodId:'rice-white-cooked',quantity:150,quantityUnit:'g'
},{
  foodId:'salsa',quantity:1,quantityUnit:'serving'
}]),t('tmpl-breakfast','Greek yogurt, oats and eggs breakfast',[{
  foodId:'greek-yogurt',quantity:170,quantityUnit:'g'
},{
  foodId:'oats',quantity:40,quantityUnit:'g'
},{
  foodId:'egg',quantity:2,quantityUnit:'serving'
}]),t('tmpl-shake','Whey protein shake and banana',[{
  foodId:'whey',quantity:1,quantityUnit:'scoop'
},{
  foodId:'banana',quantity:1,quantityUnit:'serving'
}])];
