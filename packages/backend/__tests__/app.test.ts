import request from 'supertest';
import { app, db } from '../src/app';

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('API Endpoints - Outfit Recommendation', () => {
  describe('GET /', () => {
    it('should return health check status', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/clothing', () => {
    it('should return all clothing items', async () => {
      const response = await request(app).get('/api/clothing');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if clothing items have the expected structure
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
      const response = await request(app).get('/api/clothing?category=top');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // All items should be tops
      response.body.forEach((item: any) => {
        expect(item.category).toBe('top');
      });
    });
  });

  describe('GET /api/weather', () => {
    it('should return weather forecast for up to 3 days', async () => {
      const response = await request(app).get('/api/weather');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body.length).toBeLessThanOrEqual(3);

      // Check if weather items have the expected structure
      const weather = response.body[0];
      expect(weather).toHaveProperty('id');
      expect(weather).toHaveProperty('date');
      expect(weather).toHaveProperty('temperature');
      expect(weather).toHaveProperty('rain');
      expect(weather).toHaveProperty('wind');
    });
  });

  describe('POST /api/outfit-recommendation', () => {
    it('should return outfit recommendation for a valid date', async () => {
      // First get a valid date from weather forecast
      const weatherResponse = await request(app).get('/api/weather');
      const validDate = weatherResponse.body[0].date;

      const response = await request(app)
        .post('/api/outfit-recommendation')
        .send({ date: validDate })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date', validDate);
      expect(response.body).toHaveProperty('weather');
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.suggestions).toHaveProperty('top');
      expect(response.body.suggestions).toHaveProperty('bottom');
      expect(response.body.suggestions).toHaveProperty('shoes');
      expect(response.body.suggestions).toHaveProperty('jacket');
    });

    it('should return 400 if date is missing', async () => {
      const response = await request(app)
        .post('/api/outfit-recommendation')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if date not found in weather forecast', async () => {
      const response = await request(app)
        .post('/api/outfit-recommendation')
        .send({ date: '2099-01-01' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
