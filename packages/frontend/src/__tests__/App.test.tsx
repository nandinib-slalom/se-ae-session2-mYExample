import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/weather handler
  rest.get('/api/weather', (req, res, ctx) => {
    const today = new Date();
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          date: new Date(today).toISOString().split('T')[0],
          temperature: 65,
          rain: 0,
          wind: 1,
        },
        {
          id: 2,
          date: new Date(today.getTime() + 86400000)
            .toISOString()
            .split('T')[0],
          temperature: 72,
          rain: 1,
          wind: 0,
        },
        {
          id: 3,
          date: new Date(today.getTime() + 172800000)
            .toISOString()
            .split('T')[0],
          temperature: 58,
          rain: 1,
          wind: 1,
        },
      ])
    );
  }),

  // POST /api/outfit-recommendation handler
  rest.post('/api/outfit-recommendation', (req, res, ctx) => {
    const { date } = req.body as { date: string };

    if (!date) {
      return res(ctx.status(400), ctx.json({ error: 'Date is required' }));
    }

    return res(
      ctx.status(200),
      ctx.json({
        date,
        weather: { id: 1, date, temperature: 65, rain: 0, wind: 1 },
        suggestions: {
          top: [
            {
              id: 1,
              category: 'top',
              name: 'T-shirt',
              temp_min: 60,
              temp_max: 85,
              suitable_for_rain: 0,
              suitable_for_wind: 0,
            },
          ],
          bottom: [
            {
              id: 5,
              category: 'bottom',
              name: 'Jeans',
              temp_min: 50,
              temp_max: 80,
              suitable_for_rain: 1,
              suitable_for_wind: 1,
            },
          ],
          shoes: [
            {
              id: 7,
              category: 'shoes',
              name: 'Sneakers',
              temp_min: 50,
              temp_max: 90,
              suitable_for_rain: 0,
              suitable_for_wind: 0,
            },
          ],
          jacket: [
            {
              id: 10,
              category: 'jacket',
              name: 'Light jacket',
              temp_min: 55,
              temp_max: 70,
              suitable_for_rain: 1,
              suitable_for_wind: 1,
            },
          ],
        },
      })
    );
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component - Outfit Recommendation', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(
      screen.getByText('🧥 Outfit Recommendation App')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Find the perfect outfit based on the weather forecast'
      )
    ).toBeInTheDocument();
  });

  test('loads and displays weather forecast', async () => {
    await act(async () => {
      render(<App />);
    });

    // Wait for weather cards to appear
    await waitFor(() => {
      // Check if at least one weather card is displayed
      const weatherCards = screen.getAllByText(/Find Outfit/);
      expect(weatherCards.length).toBeGreaterThan(0);
    });
  });

  test('displays weather information', async () => {
    await act(async () => {
      render(<App />);
    });

    // Wait for temperature to be displayed
    await waitFor(() => {
      expect(screen.getByText(/65°F/, { exact: false })).toBeInTheDocument();
    });
  });

  test('shows outfit recommendations on Find Outfit button click', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    // Wait for Find Outfit buttons to appear
    const findOutfitButtons = await waitFor(() =>
      screen.getAllByText('Find Outfit')
    );
    expect(findOutfitButtons.length).toBeGreaterThan(0);

    // Click the first Find Outfit button
    await act(async () => {
      await user.click(findOutfitButtons[0]);
    });

    // Wait for outfit recommendations to appear
    await waitFor(() => {
      expect(
        screen.getByText(/👔 Outfit Recommendations/)
      ).toBeInTheDocument();
    });

    // Check if clothing categories are displayed
    expect(screen.getByText(/Top/)).toBeInTheDocument();
    expect(screen.getByText(/Bottom/)).toBeInTheDocument();
    expect(screen.getByText(/Shoes/)).toBeInTheDocument();
    expect(screen.getByText(/Jacket/)).toBeInTheDocument();
  });

  test('handles API error for weather', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/weather', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    // Wait for error message
    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch weather forecast/)
      ).toBeInTheDocument();
    });
  });

  test('displays clothing item details with properties', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    // Wait for Find Outfit buttons to appear
    const findOutfitButtons = await waitFor(() =>
      screen.getAllByText('Find Outfit')
    );

    // Click the first Find Outfit button
    await act(async () => {
      await user.click(findOutfitButtons[0]);
    });

    // Wait for outfit recommendations to appear
    await waitFor(() => {
      expect(
        screen.getByText(/👔 Outfit Recommendations/)
      ).toBeInTheDocument();
    });

    // Click View Details to expand item information
    const detailsButtons = screen.getAllByText(/View Details/);
    if (detailsButtons.length > 0) {
      await act(async () => {
        await user.click(detailsButtons[0]);
      });

      // Check if temperature range is displayed
      await waitFor(() => {
        expect(
          screen.getByText(/°F -/, { exact: false })
        ).toBeInTheDocument();
      });
    }
  });
});
