import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_SALON_ID, MOCK_SALON, MOCK_SERVICES } from '@/lib/mockData';
import { useMockBookings } from '@/contexts/MockBookingsContext';
import { ArrowLeft, ChevronRight, ChevronLeft, Check } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { Toast } from '@/components/Toast';

type Salon = {
  id: string;
  name: string;
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

const STEPS = [
  { key: 1, label: 'Service' },
  { key: 2, label: 'Date & time' },
  { key: 3, label: 'Confirm' },
];

export default function BookPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const { addMockBooking } = useMockBookings();

  useEffect(() => {
    if (id === MOCK_SALON_ID) {
      setSalon(MOCK_SALON as Salon);
      setServices(MOCK_SERVICES as Service[]);
      setLoading(false);
    } else {
      fetchSalon();
      fetchServices();
    }
  }, [id]);

  const fetchSalon = async () => {
    const { data, error } = await supabase
      .from('salons')
      .select('id, name, opening_time, closing_time')
      .eq('id', id)
      .maybeSingle();
    if (data && !error) setSalon(data);
    setLoading(false);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', id)
      .order('price', { ascending: true });
    if (data && !error) setServices(data);
  };

  const canProceed = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate && !!selectedTime;
    return true;
  };

  const handleNext = () => {
    if (step < 3 && canProceed()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !profile) return;
    setBookingLoading(true);
    const notesText = notes.trim() || '';
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('bookings').insert({
        customer_id: profile.id,
        salon_id: id,
        service_id: selectedService.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        status: 'pending',
        notes: notesText,
      });
      setBookingLoading(false);
      if (error) {
        alert('Failed to create booking: ' + error.message);
        return;
      }
    } else {
      setBookingLoading(false);
      const salonName = id === MOCK_SALON_ID ? MOCK_SALON.name : salon?.name ?? '';
      const salonAddress = id === MOCK_SALON_ID ? MOCK_SALON.address : '';
      addMockBooking({
        customer_id: profile.id,
        salon_id: id,
        service_id: selectedService.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        status: 'pending',
        notes: notesText,
        salon: { name: salonName, address: salonAddress },
        service: {
          name: selectedService.name,
          duration_minutes: selectedService.duration_minutes,
          price: selectedService.price,
        },
      });
    }
    setToastVisible(true);
    router.replace('/(tabs)/bookings');
  };

  const timeSlots: string[] = [];
  if (salon) {
    const openHour = parseInt(salon.opening_time.split(':')[0], 10);
    const closeHour = parseInt(salon.closing_time.split(':')[0], 10);
    for (let hour = openHour; hour < closeHour; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
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

  const renderStepper = () => (
    <View style={styles.stepperContainer}>
      {STEPS.map((s, index) => {
        const isActive = step === s.key;
        const isPast = step > s.key;
        return (
          <React.Fragment key={s.key}>
            <View style={styles.stepperStep}>
              <View
                style={[
                  styles.stepperCircle,
                  isActive && styles.stepperCircleActive,
                  isPast && styles.stepperCircleDone,
                ]}
              >
                {isPast ? (
                  <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                ) : (
                  <Text style={[styles.stepperNumber, isActive && styles.stepperNumberActive]}>
                    {s.key}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepperLabel, isActive && styles.stepperLabelActive]}>{s.label}</Text>
            </View>
            {index < STEPS.length - 1 && (
              <View style={[styles.stepperLine, step > s.key && styles.stepperLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Select a service</Text>
          {services.map((svc) => (
            <Pressable
              key={svc.id}
              style={({ pressed }) => [
                styles.serviceOption,
                selectedService?.id === svc.id && styles.serviceOptionSelected,
                pressed && styles.serviceOptionPressed,
              ]}
              onPress={() => setSelectedService(svc)}
            >
              <View style={styles.serviceOptionInfo}>
                <Text style={styles.serviceOptionName}>{svc.name}</Text>
                <Text style={styles.serviceOptionMeta}>
                  {svc.duration_minutes} min · R{svc.price.toFixed(2)}
                </Text>
              </View>
              {selectedService?.id === svc.id && (
                <Check size={22} color="#FF6B9D" strokeWidth={2.5} />
              )}
            </Pressable>
          ))}
        </View>
      );
    }
    if (step === 2) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Select date and time</Text>
          <Text style={styles.inputLabel}>Date</Text>
          <Calendar
            onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
            markedDates={{ [selectedDate]: { selected: true, selectedColor: '#FF6B9D' } }}
            theme={{
              selectedDayBackgroundColor: '#FF6B9D',
              todayTextColor: '#FF6B9D',
              arrowColor: '#FF6B9D',
            }}
            minDate={new Date().toISOString().split('T')[0]}
          />
          <Text style={styles.inputLabel}>Time slot</Text>
          <View style={styles.timeSlots}>
            {timeSlots.map((time) => (
              <Pressable
                key={time}
                style={[styles.timeSlot, selectedTime === time && styles.timeSlotSelected]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[styles.timeSlotText, selectedTime === time && styles.timeSlotTextSelected]}
                >
                  {time}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.inputLabel}>Additional notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special requests or notes..."
            placeholderTextColor="#CCCCCC"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      );
    }
    if (step === 3) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Confirm your booking</Text>
          <View style={styles.summaryCard}>
            {selectedService && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryValue}>
                  {selectedService.name} · R{selectedService.price.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>{selectedTime || '—'}</Text>
            </View>
            {notes.trim() && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Notes</Text>
                <Text style={styles.summaryValue}>{notes.trim()}</Text>
              </View>
            )}
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
      <Toast
        message="Booking confirmed! View it under My Bookings."
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#2D2D2D" strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Book appointment</Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderStepper()}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 ? (
          <Pressable
            style={({ pressed }) => [styles.footerBack, pressed && styles.buttonPressed]}
            onPress={handleBack}
          >
            <ChevronLeft size={20} color="#FF6B9D" strokeWidth={2} />
            <Text style={styles.footerBackText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.footerBack} />
        )}
        {step < 3 ? (
          <Pressable
            style={({ pressed }) => [
              styles.footerNext,
              !canProceed() && styles.footerNextDisabled,
              pressed && canProceed() && styles.buttonPressed,
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.footerNextText}>Next</Text>
            <ChevronRight size={20} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.footerConfirm,
              bookingLoading && styles.footerNextDisabled,
              pressed && !bookingLoading && styles.buttonPressed,
            ]}
            onPress={handleConfirmBooking}
            disabled={bookingLoading}
          >
            <Text style={styles.footerNextText}>
              {bookingLoading ? 'Booking...' : 'Confirm booking'}
            </Text>
          </Pressable>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingText: { textAlign: 'center', marginTop: 100, fontSize: 16, color: '#666666' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#2D2D2D' },
  headerSpacer: { width: 40 },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },
  stepperStep: { alignItems: 'center', minWidth: 56 },
  stepperCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCircleActive: { backgroundColor: '#FF6B9D' },
  stepperCircleDone: { backgroundColor: '#4CAF50' },
  stepperNumber: { fontSize: 14, fontWeight: '700', color: '#666666' },
  stepperNumberActive: { color: '#FFFFFF' },
  stepperLabel: { fontSize: 10, fontWeight: '600', color: '#999999', marginTop: 6 },
  stepperLabelActive: { color: '#FF6B9D' },
  stepperLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
    maxWidth: 24,
  },
  stepperLineDone: { backgroundColor: '#4CAF50' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24, flexGrow: 1 },
  stepContent: {},
  stepTitle: { fontSize: 20, fontWeight: '700', color: '#2D2D2D', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#666666', marginBottom: 16 },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
    marginTop: 16,
    marginBottom: 10,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: '#FFD4E5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  serviceOptionSelected: { borderColor: '#FF6B9D', backgroundColor: '#FFE5E5' },
  serviceOptionPressed: { opacity: 0.9 },
  serviceOptionInfo: {},
  serviceOptionName: { fontSize: 17, fontWeight: '700', color: '#2D2D2D', marginBottom: 4 },
  serviceOptionMeta: { fontSize: 14, color: '#666666' },
  timeSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  timeSlot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD4E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  timeSlotSelected: { backgroundColor: '#FF6B9D', borderColor: '#FF6B9D' },
  timeSlotText: { fontSize: 14, color: '#666666', fontWeight: '600' },
  timeSlotTextSelected: { color: '#FFFFFF' },
  notesInput: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: '#FFD4E5',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#2D2D2D',
    minHeight: 80,
  },
  summaryCard: {
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD4E5',
  },
  summaryRow: { marginBottom: 12 },
  summaryLabel: { fontSize: 13, fontWeight: '600', color: '#666666', marginBottom: 4 },
  summaryValue: { fontSize: 16, color: '#2D2D2D' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#FFE5E5',
    backgroundColor: '#FFFFFF',
  },
  footerBack: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 80 },
  footerBackText: { fontSize: 16, fontWeight: '600', color: '#FF6B9D' },
  footerNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  footerNextDisabled: { opacity: 0.5 },
  footerNextText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  footerConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonPressed: { opacity: 0.85 },
});
