import { useState, useEffect, ChangeEvent } from 'react';
import './App.css';

interface Weather {
  id: number;
  date: string;
  temperature: number;
  rain: number;
  wind: number;
}

interface ClothingItem {
  id: number;
  category: string;
  name: string;
  temp_min: number;
  temp_max: number;
  suitable_for_rain: number;
  suitable_for_wind: number;
}

interface Recommendation {
  date: string;
  weather: Weather;
  suggestions: {
    top: ClothingItem[];
    bottom: ClothingItem[];
    shoes: ClothingItem[];
    jacket: ClothingItem[];
  };
}

interface Selections {
  top: string | null;
  bottom: string | null;
  shoes: string | null;
  jacket: string | null;
}

function App(): JSX.Element {
  const [weatherForecast, setWeatherForecast] = useState<Weather[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [selections, setSelections] = useState<Selections>({
    top: null,
    bottom: null,
    shoes: null,
    jacket: null,
  });

  useEffect(() => {
    fetchWeatherForecast();
  }, []);

  const fetchWeatherForecast = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error('Failed to fetch weather');
      }
      const result: Weather[] = await response.json();
      setWeatherForecast(result);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to fetch weather forecast: ' + errorMessage);
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFindOutfit = async (date: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/outfit-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date }),
      });

      if (!response.ok) {
        throw new Error('Failed to get outfit recommendation');
      }

      const result: Recommendation = await response.json();
      setRecommendation(result);
      setSelections({
        top: null,
        bottom: null,
        shoes: null,
        jacket: null,
      });
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error';
      setError('Error getting outfit recommendation: ' + errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (category: keyof Selections, itemId: string): void => {
    setSelections({
      ...selections,
      [category]: itemId,
    });
  };

  const getWeatherIcon = (weather: Weather | null): string => {
    if (!weather) return '';
    const icons: string[] = [];
    if (weather.rain) icons.push('🌧️ Rain');
    if (weather.wind) icons.push('💨 Wind');
    if (icons.length === 0) icons.push('☀️ Clear');
    return icons.join(' • ');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧥 Outfit Recommendation App</h1>
        <p>Find the perfect outfit based on the weather forecast</p>
      </header>

      <main>
        <section className="weather-section">
          <h2>📅 3-Day Weather Forecast</h2>
          {loading && weatherForecast.length === 0 && (
            <p>Loading weather forecast...</p>
          )}
          {error && <p className="error">{error}</p>}
          {weatherForecast.length > 0 && (
            <div className="weather-cards">
              {weatherForecast.map((weather: Weather) => (
                <div key={weather.id} className="weather-card">
                  <h3>
                    {new Date(weather.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>
                  <p className="temperature">🌡️ {weather.temperature}°F</p>
                  <p className="conditions">{getWeatherIcon(weather)}</p>
                  <button
                    onClick={() => handleFindOutfit(weather.date)}
                    disabled={loading}
                    className="find-outfit-btn"
                  >
                    Find Outfit
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {recommendation && (
          <section className="outfit-section">
            <h2>👔 Outfit Recommendations</h2>
            <p className="selected-date">
              Weather for {new Date(recommendation.date).toLocaleDateString()}:
              <strong>
                {' '}
                {recommendation.weather.temperature}°F •{' '}
                {getWeatherIcon(recommendation.weather)}
              </strong>
            </p>

            <div className="clothing-categories">
              {(['top', 'bottom', 'shoes', 'jacket'] as const).map(
                (category) => (
                  <div key={category} className="category-section">
                    <h3>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h3>
                    {recommendation.suggestions[category].length > 0 ? (
                      <select
                        value={selections[category] || ''}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          handleSelect(category, e.target.value)
                        }
                        className="category-select"
                      >
                        <option value="">Choose a {category}</option>
                        {recommendation.suggestions[category].map(
                          (item: ClothingItem) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <p className="no-items">
                        No suitable items for this weather
                      </p>
                    )}

                    {recommendation.suggestions[category].length > 0 && (
                      <details className="item-details">
                        <summary>View Details</summary>
                        <ul>
                          {recommendation.suggestions[category].map(
                            (item: ClothingItem) => (
                              <li key={item.id} className="item-info">
                                <strong>{item.name}</strong>
                                <div className="item-properties">
                                  <span className="temp-range">
                                    🌡️ {item.temp_min}°F - {item.temp_max}°F
                                  </span>
                                  <span
                                    className={`rain-suitable ${
                                      item.suitable_for_rain
                                        ? 'suitable'
                                        : 'not-suitable'
                                    }`}
                                  >
                                    {
                                      '🌧️ ' +
                                      (item.suitable_for_rain
                                        ? 'Rain-Suitable'
                                        : 'Not for Rain')
                                    }
                                  </span>
                                  <span
                                    className={`wind-suitable ${
                                      item.suitable_for_wind
                                        ? 'suitable'
                                        : 'not-suitable'
                                    }`}
                                  >
                                    {
                                      '💨 ' +
                                      (item.suitable_for_wind
                                        ? 'Wind-Suitable'
                                        : 'Not for Wind')
                                    }
                                  </span>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </details>
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
