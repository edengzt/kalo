# NutriTrack UI Reference Prototype

A standalone HTML/CSS/JavaScript visual prototype for the sage-and-cream calorie tracker redesign.

## Run it
Open `index.html` in a browser. No build step or dependencies are required. Google Fonts are loaded over the internet; system sans-serif fallbacks are defined.

## What is included
- Responsive desktop sidebar and mobile bottom navigation
- Home dashboard with calorie/macro card, month calendar, monthly summary, and meal list
- Recipes library screen
- Add Food screen
- Progress screen
- Settings screen
- Basic navigation, calendar selection/month navigation, recipe filtering, and add-button feedback

## Important
This is a **design reference prototype**, not a production app and not a replacement for your existing React Native/app implementation. The food values, recipes, and calendar statuses are illustrative sample data. Port the visual system and interaction patterns into the existing app while retaining its current data layer and functionality.

## Suggested agent workflow
1. Inspect the existing app and identify its current component/theme/navigation structure.
2. Open this prototype in a browser and compare it with the current app.
3. Port the color tokens, spacing, typography, card styles, and screen hierarchy.
4. Reuse existing business logic and data models. Do not copy the mock sample data into production.
5. Implement and verify each screen incrementally.
