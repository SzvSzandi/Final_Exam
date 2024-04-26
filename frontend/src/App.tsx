import React, { useState } from 'react';
import { z } from 'zod';
import { safeFetch, Params, Response } from './lib/safeFetch';

type Hotel = {
  id: number;
  name: string;
  pricePerNightInUSD: number;
};

type QueryParams = {
  min?: number;
  max?: number;
  includes?: string;
};

const App: React.FC = () => {
  const [hotels, setHotels] = useState([] as Hotel[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState({ min: 0, max: 100, includes: '' } as QueryParams);

 
  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
  
    const queryString = new URLSearchParams({
      min: String(queryParams.min),
      max: String(queryParams.max),
      includes: queryParams.includes || ''
    }).toString();
    const params: Params = {
      path: '/api/hotels?' + queryString,
      method: 'GET',
    };
  
    const schema = z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        pricePerNightInUSD: z.number(),
      })
    );
  
    const response: Response<typeof schema> = await safeFetch(params, schema);

    if (response.success) {
      const hotelData = schema.parse(response.data);
      setHotels(hotelData);
    } else {
      setError(`Error fetching hotels. Status code: ${response.status}`);
    }
  
    setLoading(false);
  };


  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: keyof QueryParams
  ) => {
    const value = event.target.value;
    setQueryParams((prevParams) => ({ ...prevParams, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchHotels();
  };

  return (
    <div>
      <h1>Searching Hotels</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="min">Min Price:</label>
          <input
            type="number"
            id="min"
            value={queryParams.min}
            onChange={(e) => handleInputChange(e, 'min')}
          />
        </div>
        <div>
          <label htmlFor="max">Max Price:</label>
          <input
            type="number"
            id="max"
            value={queryParams.max}
            onChange={(e) => handleInputChange(e, 'max')}
          />
        </div>
        <div>
          <label htmlFor="includes">Name Includes:</label>
          <input
            type="text"
            id="includes"
            value={queryParams.includes}
            onChange={(e) => handleInputChange(e, 'includes')}
          />
        </div>
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {hotels.map((hotel) => (
          <li key={hotel.id}>
            {hotel.name} - ${hotel.pricePerNightInUSD} / Night
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;