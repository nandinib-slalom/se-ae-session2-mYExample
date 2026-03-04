import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Outfit Recommendation App
 */
export class OutfitRecommendationPage extends BasePage {
  // Page elements
  private readonly appHeader = '.App-header h1';
  private readonly weatherSection = '.weather-section';
  private readonly weatherCards = '.weather-card';
  private readonly findOutfitButtons = '.find-outfit-btn';
  private readonly outfitSection = '.outfit-section';
  private readonly clothingCategories = '.category-section';
  private readonly categorySelectors = '.category-select';
  private readonly loadingIndicator = 'p:has-text("Loading weather forecast")';
  private readonly errorMessage = '.error';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the app
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Get the app title
   */
  async getAppTitle(): Promise<string> {
    return await this.getText(this.appHeader);
  }

  /**
   * Check if weather forecast is loaded
   */
  async isWeatherForecastLoaded(): Promise<boolean> {
    return await this.isVisible(this.weatherSection);
  }

  /**
   * Get the number of weather cards displayed
   */
  async getWeatherCardCount(): Promise<number> {
    return await this.page.locator(this.weatherCards).count();
  }

  /**
   * Get weather card information by index
   */
  async getWeatherCardInfo(index: number): Promise<{
    date: string;
    temperature: string;
    conditions: string;
  }> {
    const card = this.page.locator(this.weatherCards).nth(index);
    const date = await card.locator('h3').textContent() || '';
    const temperature = await card.locator('.temperature').textContent() || '';
    const conditions = await card.locator('.conditions').textContent() || '';

    return { date, temperature, conditions };
  }

  /**
   * Click the "Find Outfit" button for a specific weather card
   */
  async clickFindOutfit(index: number): Promise<void> {
    const button = this.page.locator(this.findOutfitButtons).nth(index);
    await button.click();
  }

  /**
   * Check if outfit recommendations are displayed
   */
  async isOutfitRecommendationsVisible(): Promise<boolean> {
    return await this.isVisible(this.outfitSection);
  }

  /**
   * Get the selected date for outfit recommendations
   */
  async getSelectedDate(): Promise<string> {
    const selectedDateElement = this.page.locator('.selected-date');
    return await selectedDateElement.textContent() || '';
  }

  /**
   * Get the number of clothing categories
   */
  async getClothingCategoryCount(): Promise<number> {
    return await this.page.locator(this.clothingCategories).count();
  }

  /**
   * Get clothing category names
   */
  async getClothingCategoryNames(): Promise<string[]> {
    const categories = await this.page.locator(this.clothingCategories).locator('h3').allTextContents();
    return categories;
  }

  /**
   * Select an item from a clothing category dropdown
   */
  async selectClothingItem(categoryIndex: number, itemValue: string): Promise<void> {
    const selector = this.page.locator(this.categorySelectors).nth(categoryIndex);
    await selector.selectOption(itemValue);
  }

  /**
   * Get available options for a clothing category
   */
  async getClothingOptions(categoryIndex: number): Promise<string[]> {
    const selector = this.page.locator(this.categorySelectors).nth(categoryIndex);
    return await selector.locator('option').allTextContents();
  }

  /**
   * Check if loading indicator is visible
   */
  async isLoading(): Promise<boolean> {
    return await this.isVisible(this.loadingIndicator);
  }

  /**
   * Get error message if present
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.isVisible(this.errorMessage)) {
      return await this.getText(this.errorMessage);
    }
    return null;
  }

  /**
   * Wait for outfit recommendations to load
   */
  async waitForOutfitRecommendations(): Promise<void> {
    await this.page.waitForSelector(this.outfitSection, { state: 'visible', timeout: 10000 });
  }

  /**
   * Wait for weather forecast to load
   */
  async waitForWeatherForecast(): Promise<void> {
    await this.page.waitForSelector(this.weatherSection, { state: 'visible', timeout: 10000 });
    // Wait for weather cards to be present
    await this.page.waitForSelector(this.weatherCards, { timeout: 10000 });
  }

  /**
   * Perform a complete outfit recommendation workflow
   */
  async recommendOutfitForDay(dayIndex: number = 0): Promise<void> {
    // Wait for weather forecast to load
    await this.waitForWeatherForecast();

    // Click find outfit for the specified day
    await this.clickFindOutfit(dayIndex);

    // Wait for outfit recommendations to appear
    await this.waitForOutfitRecommendations();
  }

  /**
   * Select outfit items for all categories
   */
  async selectCompleteOutfit(): Promise<void> {
    const categoryCount = await this.getClothingCategoryCount();

    for (let i = 0; i < categoryCount; i++) {
      const options = await this.getClothingOptions(i);
      // Skip the "Choose a..." option and select the first actual item
      if (options.length > 1) {
        await this.selectClothingItem(i, options[1]);
      }
    }
  }

  /**
   * Verify that the app is properly loaded
   */
  async verifyAppLoaded(): Promise<void> {
    await expect(this.page.locator(this.appHeader)).toBeVisible();
    await expect(this.page.locator(this.appHeader)).toContainText('Outfit Recommendation App');
  }
}