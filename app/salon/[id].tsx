import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Clock, Scissors, Calendar as CalendarIcon, DollarSign } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';

type Salon = {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  image_url: string | null;
  opening_time: string;
  closing_time: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
};

export default function SalonDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchSalonDetails();
    fetchServices();
  }, [id]);

  const fetchSalonDetails = async () => {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data && !error) {
      setSalon(data);
    }
    setLoading(false);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', id)
      .order('price', { ascending: true });

    if (data && !error) {
      setServices(data);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !profile) return;

    setBookingLoading(true);

    const { error } = await supabase.from('bookings').insert({
      customer_id: profile.id,
      salon_id: id as string,
      service_id: selectedService.id,
      booking_date: selectedDate,
      booking_time: selectedTime,
      status: 'pending',
      notes: notes,
    });

    setBookingLoading(false);

    if (error) {
      alert('Failed to create booking: ' + error.message);
    } else {
      setShowBookingModal(false);
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      alert('Booking request sent! The salon will confirm your appointment.');
      router.back();
    }
  };

  const timeSlots = [];
  if (salon) {
    const openHour = parseInt(salon.opening_time.split(':')[0]);
    const closeHour = parseInt(salon.closing_time.split(':')[0]);

    for (let hour = openHour; hour < closeHour; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
        <Text style={styles.loadingText}>Loading salon details...</Text>
      </LinearGradient>
    );
  }

  if (!salon) {
    return (
      <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
        <Text style={styles.loadingText}>Salon not found</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#2D2D2D" strokeWidth={2} />
      </Pressable>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {salon.image_url ? (
            <Image source={{ uri: salon.image_url }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Scissors size={64} color="#FF6B9D" strokeWidth={1.5} />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{salon.name}</Text>
          <Text style={styles.description}>{salon.description}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MapPin size={18} color="#666666" strokeWidth={2} />
              <Text style={styles.metaText}>{salon.address}</Text>
            </View>

            <View style={styles.metaItem}>
              <Clock size={18} color="#666666" strokeWidth={2} />
              <Text style={styles.metaText}>
                {salon.opening_time.slice(0, 5)} - {salon.closing_time.slice(0, 5)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Services</Text>

          {services.length === 0 ? (
            <Text style={styles.emptyText}>No services available yet</Text>
          ) : (
            services.map((service) => (
              <Pressable
                key={service.id}
                style={({ pressed }) => [
                  styles.serviceCard,
                  pressed && styles.serviceCardPressed,
                ]}
                onPress={() => handleServiceSelect(service)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>

                  <View style={styles.serviceMetaContainer}>
                    <View style={styles.serviceMeta}>
                      <Clock size={14} color="#666666" strokeWidth={2} />
                      <Text style={styles.serviceMetaText}>{service.duration_minutes} min</Text>
                    </View>

                    <View style={styles.serviceMeta}>
                      <DollarSign size={14} color="#666666" strokeWidth={2} />
                      <Text style={styles.serviceMetaText}>${service.price.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showBookingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <Pressable onPress={() => setShowBookingModal(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedService && (
              <View style={styles.selectedServiceCard}>
                <Text style={styles.selectedServiceName}>{selectedService.name}</Text>
                <Text style={styles.selectedServicePrice}>${selectedService.price.toFixed(2)}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Select Date</Text>
            <Calendar
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#FF6B9D' },
              }}
              theme={{
                selectedDayBackgroundColor: '#FF6B9D',
                todayTextColor: '#FF6B9D',
                arrowColor: '#FF6B9D',
              }}
              minDate={new Date().toISOString().split('T')[0]}
            />

            <Text style={styles.inputLabel}>Select Time</Text>
            <View style={styles.timeSlots}>
              {timeSlots.map((time) => (
                <Pressable
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotSelected,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === time && styles.timeSlotTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Any special requests or notes..."
              placeholderTextColor="#CCCCCC"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Pressable
              style={[
                styles.confirmButton,
                (!selectedDate || !selectedTime || bookingLoading) && styles.confirmButtonDisabled,
              ]}
              onPress={handleBooking}
              disabled={!selectedDate || !selectedTime || bookingLoading}
            >
              <Text style={styles.confirmButtonText}>
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#666666',
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 20,
  },
  metaContainer: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    fontSize: 14,
    color: '#666666',
  },
  servicesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 10,
    lineHeight: 18,
  },
  serviceMetaContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceMetaText: {
    fontSize: 13,
    color: '#666666',
  },
  bookButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  closeButton: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  selectedServiceCard: {
    backgroundColor: '#FFF0F0',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedServiceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  selectedServicePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
    marginTop: 20,
    marginBottom: 12,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  timeSlot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD4E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  timeSlotSelected: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: '#FFD4E5',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#2D2D2D',
    minHeight: 100,
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
