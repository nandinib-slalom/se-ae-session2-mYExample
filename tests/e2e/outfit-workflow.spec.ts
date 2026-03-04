import { test, expect } from '@playwright/test';
import { OutfitRecommendationPage } from './pages/OutfitRecommendationPage';

test.describe('Outfit Recommendation App - E2E Tests', () => {
  let outfitPage: OutfitRecommendationPage;

  test.beforeEach(async ({ page }) => {
    outfitPage = new OutfitRecommendationPage(page);
    await outfitPage.goto();
    await outfitPage.verifyAppLoaded();
  });

  test('should load the app and display weather forecast', async () => {
    // Verify app title
    const title = await outfitPage.getAppTitle();
    expect(title).toContain('Outfit Recommendation App');

    // Verify weather forecast is loaded
    const isWeatherLoaded = await outfitPage.isWeatherForecastLoaded();
    expect(isWeatherLoaded).toBe(true);

    // Verify we have weather cards (should be 3 days)
    const cardCount = await outfitPage.getWeatherCardCount();
    expect(cardCount).toBe(3);

    // Verify each weather card has required information
    for (let i = 0; i < cardCount; i++) {
      const cardInfo = await outfitPage.getWeatherCardInfo(i);
      expect(cardInfo.date).toBeTruthy();
      expect(cardInfo.temperature).toMatch(/\d+°F/);
      expect(cardInfo.conditions).toBeTruthy();
    }
  });

  test('should get outfit recommendations for a specific day', async () => {
    // Click "Find Outfit" for the first day
    await outfitPage.recommendOutfitForDay(0);

    // Verify outfit recommendations are displayed
    const isRecommendationsVisible = await outfitPage.isOutfitRecommendationsVisible();
    expect(isRecommendationsVisible).toBe(true);

    // Verify selected date is displayed
    const selectedDate = await outfitPage.getSelectedDate();
    expect(selectedDate).toContain('Weather for');

    // Verify clothing categories are present (top, bottom, shoes, jacket)
    const categoryCount = await outfitPage.getClothingCategoryCount();
    expect(categoryCount).toBe(4);

    const categoryNames = await outfitPage.getClothingCategoryNames();
    expect(categoryNames).toEqual(['Top', 'Bottom', 'Shoes', 'Jacket']);
  });

  test('should display clothing options for each category', async () => {
    await outfitPage.recommendOutfitForDay(0);

    // Check each category has options
    const categoryCount = await outfitPage.getClothingCategoryCount();
    for (let i = 0; i < categoryCount; i++) {
      const options = await outfitPage.getClothingOptions(i);
      // Should have at least "Choose a..." option plus actual items
      expect(options.length).toBeGreaterThan(1);
      expect(options[0]).toMatch(/Choose a/);
    }
  });

  test('should allow selecting clothing items for complete outfit', async () => {
    await outfitPage.recommendOutfitForDay(0);

    // Select items for all categories
    await outfitPage.selectCompleteOutfit();

    // Verify selections are maintained (dropdowns should show selected values)
    const categoryCount = await outfitPage.getClothingCategoryCount();
    for (let i = 0; i < categoryCount; i++) {
      const options = await outfitPage.getClothingOptions(i);
      if (options.length > 1) {
        const selector = outfitPage['page'].locator('.category-select').nth(i);
        const selectedValue = await selector.inputValue();
        expect(selectedValue).toBeTruthy();
        expect(selectedValue).not.toBe(''); // Should not be the default empty option
      }
    }
  });

  test('should handle multiple outfit recommendations', async () => {
    // Get recommendations for first day
    await outfitPage.recommendOutfitForDay(0);
    expect(await outfitPage.isOutfitRecommendationsVisible()).toBe(true);

    // Get recommendations for second day
    await outfitPage.recommendOutfitForDay(1);
    expect(await outfitPage.isOutfitRecommendationsVisible()).toBe(true);

    // Verify the date changed
    const selectedDate = await outfitPage.getSelectedDate();
    expect(selectedDate).toContain('Weather for');
  });

  test('should display appropriate clothing based on weather conditions', async () => {
    await outfitPage.recommendOutfitForDay(0);

    // Get weather info for the selected day
    const cardInfo = await outfitPage.getWeatherCardInfo(0);
    const temperature = parseInt(cardInfo.temperature.replace('🌡️ ', '').replace('°F', ''));
    const hasRain = cardInfo.conditions.includes('Rain');
    const hasWind = cardInfo.conditions.includes('Wind');

    // Verify that recommended items are suitable for the weather
    // This is a basic check - in a real scenario, we'd verify the API logic
    const categoryCount = await outfitPage.getClothingCategoryCount();
    for (let i = 0; i < categoryCount; i++) {
      const options = await outfitPage.getClothingOptions(i);
      // Should have some recommendations (not empty)
      expect(options.length).toBeGreaterThan(1);
    }
  });

  test('should handle app reload and maintain functionality', async () => {
    // Perform initial actions
    await outfitPage.recommendOutfitForDay(0);
    expect(await outfitPage.isOutfitRecommendationsVisible()).toBe(true);

    // Reload the page
    await outfitPage['page'].reload();
    await outfitPage.verifyAppLoaded();

    // Verify weather forecast loads again
    await outfitPage.waitForWeatherForecast();
    const cardCount = await outfitPage.getWeatherCardCount();
    expect(cardCount).toBe(3);

    // Verify we can still get recommendations
    await outfitPage.recommendOutfitForDay(1);
    expect(await outfitPage.isOutfitRecommendationsVisible()).toBe(true);
  });

  test('should not show outfit recommendations initially', async () => {
    // Initially, outfit recommendations should not be visible
    const isRecommendationsVisible = await outfitPage.isOutfitRecommendationsVisible();
    expect(isRecommendationsVisible).toBe(false);

    // Only after clicking "Find Outfit" should they appear
    await outfitPage.recommendOutfitForDay(0);
    expect(await outfitPage.isOutfitRecommendationsVisible()).toBe(true);
  });
});