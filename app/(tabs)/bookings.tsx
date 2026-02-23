import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, MapPin, Scissors, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

type Booking = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  salon: {
    name: string;
    address: string;
  };
  service: {
    name: string;
    duration_minutes: number;
    price: number;
  };
  customer?: {
    full_name: string;
    phone: string;
  };
};

export default function BookingsScreen() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isSalonOwner = profile?.role === 'salon_owner';

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!profile) return;

    let query = supabase
      .from('bookings')
      .select(`
        *,
        salon:salons(name, address),
        service:services(name, duration_minutes, price)
      `);

    if (isSalonOwner) {
      query = query.select(`
        *,
        salon:salons(name, address),
        service:services(name, duration_minutes, price),
        customer:profiles!customer_id(full_name, phone)
      `);

      const { data: salonData } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', profile.id)
        .maybeSingle();

      if (salonData) {
        query = query.eq('salon_id', salonData.id);
      }
    } else {
      query = query.eq('customer_id', profile.id);
    }

    const { data, error } = await query.order('booking_date', { ascending: false });

    if (data && !error) {
      setBookings(data as Booking[]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const updateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (!error) {
      fetchBookings();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={18} color="#4CAF50" strokeWidth={2} />;
      case 'cancelled':
        return <XCircle size={18} color="#FF4757" strokeWidth={2} />;
      case 'completed':
        return <CheckCircle size={18} color="#999999" strokeWidth={2} />;
      default:
        return <AlertCircle size={18} color="#FFA726" strokeWidth={2} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'cancelled':
        return '#FF4757';
      case 'completed':
        return '#999999';
      default:
        return '#FFA726';
    }
  };

  return (
    <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isSalonOwner ? 'Salon Bookings' : 'My Bookings'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B9D" />
        }
      >
        {loading ? (
          <Text style={styles.emptyText}>Loading bookings...</Text>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color="#FFD4E5" strokeWidth={1.5} />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>
              {isSalonOwner
                ? 'Bookings from customers will appear here'
                : 'Book your first appointment to get started'}
            </Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.statusContainer}>
                  {getStatusIcon(booking.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingInfo}>
                <View style={styles.infoRow}>
                  <Scissors size={18} color="#FF6B9D" strokeWidth={2} />
                  <Text style={styles.serviceName}>{booking.service.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MapPin size={16} color="#666666" strokeWidth={2} />
                  <Text style={styles.infoText}>{booking.salon.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Calendar size={16} color="#666666" strokeWidth={2} />
                  <Text style={styles.infoText}>
                    {new Date(booking.booking_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Clock size={16} color="#666666" strokeWidth={2} />
                  <Text style={styles.infoText}>
                    {booking.booking_time.slice(0, 5)} ({booking.service.duration_minutes} min)
                  </Text>
                </View>

                {isSalonOwner && booking.customer && (
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{booking.customer.full_name}</Text>
                    <Text style={styles.customerPhone}>{booking.customer.phone}</Text>
                  </View>
                )}

                {booking.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{booking.notes}</Text>
                  </View>
                )}

                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>${booking.service.price.toFixed(2)}</Text>
                </View>
              </View>

              {isSalonOwner && booking.status === 'pending' && (
                <View style={styles.actions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => updateBookingStatus(booking.id, 'confirmed')}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.cancelButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => updateBookingStatus(booking.id, 'cancelled')}
                  >
                    <Text style={styles.cancelButtonText}>Decline</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingInfo: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
  },
  customerInfo: {
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666666',
  },
  notesContainer: {
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#2D2D2D',
    lineHeight: 20,
  },
  priceContainer: {
    marginTop: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFE5E5',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  cancelButtonText: {
    color: '#FF4757',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
