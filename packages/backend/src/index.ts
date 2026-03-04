import { app } from './app';

const PORT = process.env.PORT || 3030;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`Outfit Recommendation API Endpoints:`);
  console.log(`  GET /api/weather - Get 3-day weather forecast`);
  console.log(`  GET /api/clothing - Get all clothing items`);
  console.log(`  POST /api/outfit-recommendation - Get outfit recommendation for a date`);
});
