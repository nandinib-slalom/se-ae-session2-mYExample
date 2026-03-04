"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
// Initialize express app
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Initialize in-memory SQLite database
const db = new better_sqlite3_1.default(':memory:');
exports.db = db;
// Create tables for clothing items and weather
db.exec(`
  CREATE TABLE IF NOT EXISTS clothing_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    temp_min INTEGER NOT NULL,
    temp_max INTEGER NOT NULL,
    suitable_for_rain INTEGER DEFAULT 0,
    suitable_for_wind INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS weather_forecast (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    temperature INTEGER NOT NULL,
    rain INTEGER DEFAULT 0,
    wind INTEGER DEFAULT 0
  );
`);
// Insert sample clothing items
const clothingItems = [
    { category: 'top', name: 'T-shirt', temp_min: 60, temp_max: 85, rain: 0, wind: 0 },
    { category: 'top', name: 'Long sleeve shirt', temp_min: 50, temp_max: 75, rain: 1, wind: 1 },
    { category: 'top', name: 'Sweater', temp_min: 40, temp_max: 65, rain: 0, wind: 1 },
    { category: 'bottom', name: 'Shorts', temp_min: 70, temp_max: 95, rain: 0, wind: 0 },
    { category: 'bottom', name: 'Jeans', temp_min: 50, temp_max: 80, rain: 1, wind: 1 },
    { category: 'bottom', name: 'Pants', temp_min: 45, temp_max: 75, rain: 1, wind: 1 },
    { category: 'shoes', name: 'Sneakers', temp_min: 50, temp_max: 90, rain: 0, wind: 0 },
    { category: 'shoes', name: 'Boots', temp_min: 30, temp_max: 70, rain: 1, wind: 1 },
    { category: 'shoes', name: 'Sandals', temp_min: 70, temp_max: 95, rain: 0, wind: 0 },
    { category: 'jacket', name: 'Light jacket', temp_min: 55, temp_max: 70, rain: 1, wind: 1 },
    { category: 'jacket', name: 'Heavy coat', temp_min: 25, temp_max: 55, rain: 1, wind: 1 },
];
const insertClothing = db.prepare(`
  INSERT INTO clothing_items (category, name, temp_min, temp_max, suitable_for_rain, suitable_for_wind)
  VALUES (?, ?, ?, ?, ?, ?)
`);
clothingItems.forEach((item) => {
    insertClothing.run(item.category, item.name, item.temp_min, item.temp_max, item.rain, item.wind);
});
// Insert sample weather forecast for next 3 days
const today = new Date();
const weatherData = [
    {
        date: new Date(today).toISOString().split('T')[0],
        temperature: 65,
        rain: 0,
        wind: 1,
    },
    {
        date: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
        temperature: 72,
        rain: 1,
        wind: 0,
    },
    {
        date: new Date(today.getTime() + 172800000).toISOString().split('T')[0],
        temperature: 58,
        rain: 1,
        wind: 1,
    },
];
const insertWeather = db.prepare(`
  INSERT INTO weather_forecast (date, temperature, rain, wind)
  VALUES (?, ?, ?, ?)
`);
weatherData.forEach((w) => {
    insertWeather.run(w.date, w.temperature, w.rain, w.wind);
});
console.log('In-memory database initialized with clothing items and weather data');
// Health check endpoint
app.get('/', (_req, res) => {
    res
        .status(200)
        .json({ status: 'ok', message: 'Outfit Recommendation API is running' });
});
// Get all clothing items by category
app.get('/api/clothing', (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM clothing_items';
        if (category) {
            query += ` WHERE category = '${category}'`;
        }
        const items = db.prepare(query).all();
        res.json(items);
    }
    catch (error) {
        console.error('Error fetching clothing items:', error);
        res.status(500).json({ error: 'Failed to fetch clothing items' });
    }
});
// Get weather forecast for up to 3 days
app.get('/api/weather', (_req, res) => {
    try {
        const forecast = db
            .prepare('SELECT * FROM weather_forecast ORDER BY date ASC LIMIT 3')
            .all();
        res.json(forecast);
    }
    catch (error) {
        console.error('Error fetching weather forecast:', error);
        res.status(500).json({ error: 'Failed to fetch weather forecast' });
    }
});
// Get outfit recommendation based on weather for a specific day
app.post('/api/outfit-recommendation', (req, res) => {
    try {
        const { date } = req.body;
        if (!date) {
            res.status(400).json({ error: 'Date is required' });
            return;
        }
        // Get weather for the specified date
        const weather = db.prepare('SELECT * FROM weather_forecast WHERE date = ?').get(date);
        if (!weather) {
            res
                .status(404)
                .json({ error: 'Weather not found for the specified date' });
            return;
        }
        // Find suitable clothing items for each category
        const categories = ['top', 'bottom', 'shoes', 'jacket'];
        const recommendation = { date, weather, suggestions: {} };
        categories.forEach((category) => {
            let query = `SELECT * FROM clothing_items WHERE category = '${category}' 
                   AND temp_min <= ${weather.temperature} 
                   AND temp_max >= ${weather.temperature}`;
            if (weather.rain) {
                query += ` AND suitable_for_rain = 1`;
            }
            if (weather.wind) {
                query += ` AND suitable_for_wind = 1`;
            }
            const items = db.prepare(query).all();
            recommendation.suggestions[category] = items;
        });
        res.json(recommendation);
    }
    catch (error) {
        console.error('Error generating outfit recommendation:', error);
        res.status(500).json({ error: 'Failed to generate outfit recommendation' });
    }
});
//# sourceMappingURL=app.js.map