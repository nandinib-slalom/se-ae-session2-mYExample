# Functional Requirements

This document will capture the functional requirements for the "What to Wear" weather-based outfit recommender app.

## Overview

The application will:

- Retrieve weather forecasts for the next day between 7 AM and 5 PM local time.
- Analyze the weather to determine suitable clothing.
- Consult the user's wardrobe inventory to suggest an outfit.
- Avoid repeating full outfits within the same week.
- Allow certain items, such as indoor jackets (e.g., denim jacket), to be reused more frequently.

## Questions

Please provide details on the following to refine requirements:

1. How will the wardrobe be represented? Will the user manually input items, upload photos, or will there be categories/predefined options?
   - **Answer:** Manual entry for now.
2. What constitutes an "outfit"? Is it a combination of top, bottom, shoes, accessories, etc.?
   - **Answer:** For now an outfit consists of top + bottom + shoes.
3. Are there user preferences for colors, styles, or formality levels?
   - **Answer:** Western business casual.
4. Should the app support multiple users/profiles, or just a single user?
   - **Answer:** Single user for now.
5. What weather parameters matter (temperature range, precipitation, wind, etc.)?
   - **Answer:** Temperature, wind, and rain.
6. How should the app handle edge cases, such as missing weather data or insufficient wardrobe items?
   - **Answer:** If weather data is missing, make an educated guess. If the wardrobe lacks suitable items, adjust with whatever is available.

Additional clarifications are welcome.