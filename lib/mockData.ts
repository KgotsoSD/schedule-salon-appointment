/**
 * Mock salon and services for testing without a database.
 * Used when Supabase is not configured or when no salon exists in the DB.
 */

export const MOCK_SALON_ID = 'mock-salon-id';

export const MOCK_SALON = {
  id: MOCK_SALON_ID,
  name: 'Blossom Hair Studio',
  description: 'Your neighbourhood salon for cuts, colour, and styling. Walk-ins welcome, or book ahead for your preferred slot.',
  address: '123 Main Street, City Centre',
  phone: '+27 11 123 4567',
  email: 'hello@blossomhair.co.za',
  image_url: null,
  opening_time: '09:00:00',
  closing_time: '18:00:00',
};

export const MOCK_SERVICES = [
  {
    id: 'mock-service-1',
    name: 'Women\'s Cut & Blow-dry',
    description: 'Cut, wash and blow-dry',
    duration_minutes: 60,
    price: 350,
  },
  {
    id: 'mock-service-2',
    name: 'Men\'s Cut',
    description: 'Cut and style',
    duration_minutes: 30,
    price: 180,
  },
  {
    id: 'mock-service-3',
    name: 'Colour & Highlights',
    description: 'Full colour or highlights',
    duration_minutes: 120,
    price: 850,
  },
  {
    id: 'mock-service-4',
    name: 'Treatment',
    description: 'Deep conditioning or repair treatment',
    duration_minutes: 45,
    price: 220,
  },
];
