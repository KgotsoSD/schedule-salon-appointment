import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { MOCK_SALON_ID, MOCK_SALON, MOCK_SERVICES } from '@/lib/mockData';
import { ArrowLeft, MapPin, Clock, Scissors, DollarSign } from 'lucide-react-native';

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
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === MOCK_SALON_ID) {
      setSalon(MOCK_SALON as Salon);
      setServices(MOCK_SERVICES as Service[]);
      setLoading(false);
    } else {
      fetchSalonDetails();
      fetchServices();
    }
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
                onPress={() => router.push(`/salon/${id}/book`)}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  content: { flex: 1 },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#666666',
  },
  imageContainer: { width: '100%', height: 300 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: { padding: 24 },
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
  metaContainer: { gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaText: { fontSize: 14, color: '#666666' },
  servicesContainer: { paddingHorizontal: 24, paddingBottom: 24 },
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
  serviceCardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  serviceInfo: { flex: 1, marginRight: 12 },
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
  serviceMetaContainer: { flexDirection: 'row', gap: 16 },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceMetaText: { fontSize: 13, color: '#666666' },
  bookButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },
  modalTitle: { fontSize: 24, fontWeight: '700', color: '#2D2D2D' },
  closeButton: { fontSize: 16, color: '#FF6B9D', fontWeight: '600' },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
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
  stepperCircleActive: {
    backgroundColor: '#FF6B9D',
  },
  stepperCircleDone: {
    backgroundColor: '#4CAF50',
  },
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
  modalContent: { flex: 1, padding: 20, paddingBottom: 24 },
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
  hairstyleInput: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: '#FFD4E5',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#2D2D2D',
    marginBottom: 16,
  },
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#FFE5E5',
  },
  footerButton: { minWidth: 100 },
  backFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backFooterButtonText: { fontSize: 16, fontWeight: '600', color: '#FF6B9D' },
  nextFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  nextFooterButtonDisabled: { opacity: 0.5 },
  nextFooterButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  confirmFooterButton: {
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
