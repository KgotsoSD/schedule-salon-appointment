import React, { createContext, useContext, useState, useCallback } from 'react';

export type MockBooking = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  customer_id: string;
  salon_id: string;
  service_id: string;
  salon: { name: string; address: string };
  service: { name: string; duration_minutes: number; price: number };
};

type MockBookingsContextType = {
  mockBookings: MockBooking[];
  addMockBooking: (booking: Omit<MockBooking, 'id'>) => void;
};

const MockBookingsContext = createContext<MockBookingsContextType | undefined>(undefined);

let mockIdCounter = 1;
function generateMockId() {
  return `mock-booking-${Date.now()}-${mockIdCounter++}`;
}

export function MockBookingsProvider({ children }: { children: React.ReactNode }) {
  const [mockBookings, setMockBookings] = useState<MockBooking[]>([]);

  const addMockBooking = useCallback((booking: Omit<MockBooking, 'id'>) => {
    setMockBookings((prev) => [
      { ...booking, id: generateMockId() },
      ...prev,
    ]);
  }, []);

  return (
    <MockBookingsContext.Provider value={{ mockBookings, addMockBooking }}>
      {children}
    </MockBookingsContext.Provider>
  );
}

export function useMockBookings() {
  const context = useContext(MockBookingsContext);
  if (context === undefined) {
    throw new Error('useMockBookings must be used within a MockBookingsProvider');
  }
  return context;
}
