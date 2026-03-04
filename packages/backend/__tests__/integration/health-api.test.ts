import request from 'supertest';
import { app, db } from '../../src/app';

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Health Check API Integration Tests', () => {
  describe('GET /', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/outfit recommendation api is running/i);
    });

    it('should handle multiple health check requests', async () => {
      const promises = Array(10).fill(null).map(() =>
        request(app).get('/')
      );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });

    it('should respond quickly to health checks', async () => {
      const startTime = Date.now();
      await request(app).get('/');
      const endTime = Date.now();

      // Health check should respond in less than 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});

describe('API Response Format Integration Tests', () => {
  it('should return JSON content type for all API endpoints', async () => {
    const endpoints = [
      '/',
      '/api/weather',
      '/api/clothing',
    ];

    for (const endpoint of endpoints) {
      const response = await request(app).get(endpoint);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    }
  });

  it('should handle CORS headers properly', async () => {
    const response = await request(app)
      .options('/api/weather')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeTruthy();
  });

  it('should include proper cache control headers', async () => {
    const response = await request(app).get('/api/weather');

    // Weather data might be cached for a short period
    expect(response.headers['cache-control']).toBeDefined();
  });
});

describe('Error Handling Integration Tests', () => {
  it('should return 404 for non-existent endpoints', async () => {
    const nonExistentEndpoints = [
      '/api/nonexistent',
      '/api/weather/forecast',
      '/api/clothing/categories',
      '/api/outfit/suggestions',
    ];

    for (const endpoint of nonExistentEndpoints) {
      const response = await request(app).get(endpoint);
      expect(response.status).toBe(404);
    }
  });

  it('should handle malformed JSON gracefully', async () => {
    const response = await request(app)
      .post('/api/outfit-recommendation')
      .set('Content-Type', 'application/json')
      .send('{invalid json}');

    // Express should handle malformed JSON
    expect([400, 500]).toContain(response.status);
  });

  it('should handle very large request payloads', async () => {
    const largePayload = {
      date: '2024-01-01',
      extraData: 'x'.repeat(10000), // 10KB of data
    };

    const response = await request(app)
      .post('/api/outfit-recommendation')
      .send(largePayload);

    // Should either process successfully or reject gracefully
    expect([200, 400, 413]).toContain(response.status);
  });

  it('should handle SQL injection attempts safely', async () => {
    const maliciousInputs = [
      "'; DROP TABLE weather_forecast; --",
      "' OR '1'='1",
      "1; SELECT * FROM clothing_items; --",
    ];

    for (const maliciousInput of maliciousInputs) {
      const response = await request(app)
        .post('/api/outfit-recommendation')
        .send({ date: maliciousInput });

      // Should not execute malicious SQL
      expect(response.status).toBe(404); // Date not found
      expect(response.body).not.toHaveProperty('sql_error');
    }
  });
});

describe('Database Connection Integration Tests', () => {
  it('should maintain database connection throughout test suite', async () => {
    // Perform multiple operations to ensure connection stability
    for (let i = 0; i < 5; i++) {
      const weatherResponse = await request(app).get('/api/weather');
      expect(weatherResponse.status).toBe(200);

      const clothingResponse = await request(app).get('/api/clothing');
      expect(clothingResponse.status).toBe(200);
    }
  });

  it('should handle database read operations under load', async () => {
    const concurrentRequests = 20;
    const promises = Array(concurrentRequests).fill(null).map(() =>
      request(app).get('/api/clothing')
    );

    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  it('should prevent database connection leaks', async () => {
    // This test ensures that database connections are properly managed
    const initialResponse = await request(app).get('/api/weather');
    expect(initialResponse.status).toBe(200);

    // Simulate multiple rapid requests
    const rapidRequests = Array(50).fill(null).map(() =>
      request(app).get('/api/clothing?category=top')
    );

    const rapidResponses = await Promise.all(rapidRequests);

    rapidResponses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    // Final check to ensure system is still responsive
    const finalResponse = await request(app).get('/');
    expect(finalResponse.status).toBe(200);
  });
});

describe('API Performance Integration Tests', () => {
  it('should respond within acceptable time limits', async () => {
    const endpoints = [
      '/',
      '/api/weather',
      '/api/clothing',
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await request(app).get(endpoint);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      // API should respond within 500ms
      expect(endTime - startTime).toBeLessThan(500);
    }
  });

  it('should handle request timeouts gracefully', async () => {
    // Test with a timeout to ensure server doesn't hang
    const response = await request(app)
      .get('/api/clothing')
      .timeout(2000); // 2 second timeout

    expect(response.status).toBe(200);
  });

  it('should maintain performance under sustained load', async () => {
    const startTime = Date.now();

    // Perform 100 requests
    const requests = Array(100).fill(null).map(() =>
      request(app).get('/api/weather')
    );

    const responses = await Promise.all(requests);
    const endTime = Date.now();

    // All requests should succeed
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    // Average response time should be reasonable
    const totalTime = endTime - startTime;
    const averageTime = totalTime / 100;
    expect(averageTime).toBeLessThan(100); // Less than 100ms average
  });
});