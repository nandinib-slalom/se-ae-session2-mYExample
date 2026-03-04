import request from 'supertest';
import { app, db } from '../../src/app';

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Weather API Integration Tests', () => {
  describe('GET /api/weather', () => {
    it('should return weather forecast data', async () => {
      const response = await request(app)
        .get('/api/weather')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body.length).toBeLessThanOrEqual(3);

      // Verify weather data structure
      const weather = response.body[0];
      expect(weather).toHaveProperty('id');
      expect(weather).toHaveProperty('date');
      expect(weather).toHaveProperty('temperature');
      expect(weather).toHaveProperty('rain');
      expect(weather).toHaveProperty('wind');

      // Verify temperature is a reasonable value
      expect(typeof weather.temperature).toBe('number');
      expect(weather.temperature).toBeGreaterThan(-50);
      expect(weather.temperature).toBeLessThan(120);
    });

    it('should return consistent data on multiple calls', async () => {
      const response1 = await request(app).get('/api/weather');
      const response2 = await request(app).get('/api/weather');

      expect(response1.body).toEqual(response2.body);
    });

    it('should handle concurrent requests', async () => {
      const promises = [
        request(app).get('/api/weather'),
        request(app).get('/api/weather'),
        request(app).get('/api/weather'),
      ];

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });
});

describe('Clothing API Integration Tests', () => {
  describe('GET /api/clothing', () => {
    it('should return all clothing items', async () => {
      const response = await request(app)
        .get('/api/clothing')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify clothing item structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('temp_min');
      expect(item).toHaveProperty('temp_max');
      expect(item).toHaveProperty('suitable_for_rain');
      expect(item).toHaveProperty('suitable_for_wind');
    });

    it('should filter clothing items by category', async () => {
      const categories = ['top', 'bottom', 'shoes', 'jacket'];

      for (const category of categories) {
        const response = await request(app)
          .get(`/api/clothing?category=${category}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        // Verify all items match the requested category
        response.body.forEach((item: any) => {
          expect(item.category).toBe(category);
        });
      }
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/clothing?category=nonexistent')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should handle invalid query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/clothing?invalid=param')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});

describe('Outfit Recommendation API Integration Tests', () => {
  describe('POST /api/outfit-recommendation', () => {
    let validDate: string;

    beforeAll(async () => {
      // Get a valid date from weather forecast
      const weatherResponse = await request(app).get('/api/weather');
      validDate = weatherResponse.body[0].date;
    });

    it('should return outfit recommendations for valid date', async () => {
      const response = await request(app)
        .post('/api/outfit-recommendation')
        .send({ date: validDate })
        .expect(200);

      expect(response.body).toHaveProperty('date', validDate);
      expect(response.body).toHaveProperty('weather');
      expect(response.body).toHaveProperty('suggestions');

      // Verify weather data
      expect(response.body.weather).toHaveProperty('temperature');
      expect(response.body.weather).toHaveProperty('rain');
      expect(response.body.weather).toHaveProperty('wind');

      // Verify suggestions structure
      const { suggestions } = response.body;
      expect(suggestions).toHaveProperty('top');
      expect(suggestions).toHaveProperty('bottom');
      expect(suggestions).toHaveProperty('shoes');
      expect(suggestions).toHaveProperty('jacket');

      // Verify each category has items
      Object.values(suggestions).forEach((categoryItems: any) => {
        expect(Array.isArray(categoryItems)).toBe(true);
      });
    });

    it('should filter recommendations based on weather conditions', async () => {
      // Find a date with rain
      const weatherResponse = await request(app).get('/api/weather');
      const rainyDay = weatherResponse.body.find((w: any) => w.rain === 1);

      if (rainyDay) {
        const response = await request(app)
          .post('/api/outfit-recommendation')
          .send({ date: rainyDay.date })
          .expect(200);

        // For rainy weather, all recommended items should be rain-suitable
        const { suggestions } = response.body;
        Object.values(suggestions).forEach((categoryItems: any) => {
          categoryItems.forEach((item: any) => {
            expect(item.suitable_for_rain).toBe(1);
          });
        });
      }
    });

    it('should filter recommendations based on wind conditions', async () => {
      // Find a date with wind
      const weatherResponse = await request(app).get('/api/weather');
      const windyDay = weatherResponse.body.find((w: any) => w.wind === 1);

      if (windyDay) {
        const response = await request(app)
          .post('/api/outfit-recommendation')
          .send({ date: windyDay.date })
          .expect(200);

        // For windy weather, all recommended items should be wind-suitable
        const { suggestions } = response.body;
        Object.values(suggestions).forEach((categoryItems: any) => {
          categoryItems.forEach((item: any) => {
            expect(item.suitable_for_wind).toBe(1);
          });
        });
      }
    });

    it('should return 400 for missing date', async () => {
      const response = await request(app)
        .post('/api/outfit-recommendation')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/date is required/i);
    });

    it('should return 404 for non-existent date', async () => {
      const response = await request(app)
        .post('/api/outfit-recommendation')
        .send({ date: '2099-01-01' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/weather not found/i);
    });

    it('should handle malformed date strings', async () => {
      const response = await request(app)
        .post('/api/outfit-recommendation')
        .send({ date: 'invalid-date' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle concurrent outfit recommendation requests', async () => {
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/outfit-recommendation')
          .send({ date: validDate })
      );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('suggestions');
      });
    });
  });
});

describe('API Integration - End-to-End Workflows', () => {
  it('should support complete outfit recommendation workflow', async () => {
    // 1. Get weather forecast
    const weatherResponse = await request(app).get('/api/weather');
    expect(weatherResponse.status).toBe(200);
    const targetWeather = weatherResponse.body[0];

    // 2. Get all clothing items
    const clothingResponse = await request(app).get('/api/clothing');
    expect(clothingResponse.status).toBe(200);

    // 3. Get outfit recommendations for the weather
    const outfitResponse = await request(app)
      .post('/api/outfit-recommendation')
      .send({ date: targetWeather.date });
    expect(outfitResponse.status).toBe(200);

    // 4. Verify recommendations match weather conditions
    const { weather, suggestions } = outfitResponse.body;
    expect(weather.temperature).toBe(targetWeather.temperature);
    expect(weather.rain).toBe(targetWeather.rain);
    expect(weather.wind).toBe(targetWeather.wind);

    // 5. Verify temperature ranges are appropriate
    Object.values(suggestions).forEach((categoryItems: any) => {
      categoryItems.forEach((item: any) => {
        expect(item.temp_min).toBeLessThanOrEqual(weather.temperature);
        expect(item.temp_max).toBeGreaterThanOrEqual(weather.temperature);
      });
    });
  });

  it('should handle error scenarios gracefully', async () => {
    // Test various error conditions
    const errorScenarios = [
      { endpoint: '/api/weather', method: 'post', data: {}, expectedStatus: 404 },
      { endpoint: '/api/clothing', method: 'post', data: {}, expectedStatus: 404 },
      { endpoint: '/api/outfit-recommendation', method: 'get', data: null, expectedStatus: 404 },
    ];

    for (const scenario of errorScenarios) {
      const req = request(app)[scenario.method as 'get' | 'post' | 'put' | 'delete'](scenario.endpoint);
      const response = scenario.method === 'post'
        ? await req.send(scenario.data || {})
        : await req;

      expect(response.status).toBe(scenario.expectedStatus);
    }
  });
});