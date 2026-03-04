# UI Guidelines - Outfit Recommendation App

## Overview
These guidelines ensure a consistent and user-friendly interface for the weather-based outfit recommender application.

## Core Features

### Weather Lookup
- **Primary Action Button**: Include a prominent button labeled "Find Outfit" or similar that allows users to search for outfit recommendations
- **Time Range**: The button should enable users to look up outfit recommendations for up to 3 days of weather forecasts
- **User Experience**: The button should be clearly visible and easily accessible on the main interface

### Weather Information Display
The application should clearly display the following weather data in the results:
- **Temperature**: Displayed in the user's preferred unit (Celsius or Fahrenheit)
- **Precipitation**: Rain status (yes/no or probability)
- **Wind**: Wind conditions (yes/no or wind speed)

### Outfit Selection Interface
- **Dropdown Selectors**: Provide separate select dropdowns for each clothing category:
  - **Top**: Shirt, sweater, t-shirt, tank top, etc.
  - **Bottom**: Pants, jeans, skirt, shorts, etc.
  - **Shoes**: Sneakers, boots, sandals, formal shoes, etc.
  - **Jacket**: Light jacket, heavy coat, blazer, etc.
- **Organization**: Each dropdown should be clearly labeled and organized in a logical order
- **Accessibility**: Dropdowns should be keyboard navigable and screen reader compatible

## Clothing Item Properties

Each clothing item in the recommendations should display the following properties:

### Temperature Compatibility
- **Temperature Range**: Display the minimum and maximum temperature range (e.g., "50°F - 75°F" or "10°C - 24°C") for which the item is appropriate
- **Format**: Show as "Min°-Max°" or use a visual temperature gauge if space allows

### Weather Conditions
- **Rainy Condition**: Indicate whether the item is suitable for rainy weather (e.g., waterproof, water-resistant, or not recommended for rain)
- **Windy Condition**: Indicate whether the item is suitable for windy conditions (e.g., secure fit, lightweight, or appropriate for wind)
- **Presentation**: Use visual indicators (icons, badges, or labels) for quick scanning

## Design Principles
- **Clarity**: Information should be easy to scan and understand at a glance
- **Responsiveness**: The interface should work well on mobile, tablet, and desktop devices
- **Accessibility**: Follow WCAG guidelines for color contrast and interactive elements
- **Consistency**: Use consistent styling, spacing, and terminology throughout the application
