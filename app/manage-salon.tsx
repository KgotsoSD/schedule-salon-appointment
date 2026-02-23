import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Edit2, Trash2, Store } from 'lucide-react-native';

type Salon = {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
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

export default function ManageSalonScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const [salonName, setSalonName] = useState('');
  const [salonDescription, setSalonDescription] = useState('');
  const [salonAddress, setSalonAddress] = useState('');
  const [salonPhone, setSalonPhone] = useState('');
  const [salonEmail, setSalonEmail] = useState('');

  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceDuration, setServiceDuration] = useState('60');
  const [servicePrice, setServicePrice] = useState('0');

  useEffect(() => {
    fetchSalon();
  }, []);

  const fetchSalon = async () => {
    if (!profile) return;

    const { data: salonData } = await supabase
      .from('salons')
      .select('*')
      .eq('owner_id', profile.id)
      .maybeSingle();

    if (salonData) {
      setSalon(salonData);
      fetchServices(salonData.id);
    }
    setLoading(false);
  };

  const fetchServices = async (salonId: string) => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .order('price', { ascending: true });

    if (data) {
      setServices(data);
    }
  };

  const handleCreateOrUpdateSalon = async () => {
    if (!profile) return;

    if (salon) {
      const { error } = await supabase
        .from('salons')
        .update({
          name: salonName,
          description: salonDescription,
          address: salonAddress,
          phone: salonPhone,
          email: salonEmail,
        })
        .eq('id', salon.id);

      if (!error) {
        setShowSalonModal(false);
        fetchSalon();
      }
    } else {
      const { error } = await supabase.from('salons').insert({
        owner_id: profile.id,
        name: salonName,
        description: salonDescription,
        address: salonAddress,
        phone: salonPhone,
        email: salonEmail,
      });

      if (!error) {
        setShowSalonModal(false);
        fetchSalon();
      }
    }
  };

  const handleOpenSalonModal = () => {
    if (salon) {
      setSalonName(salon.name);
      setSalonDescription(salon.description);
      setSalonAddress(salon.address);
      setSalonPhone(salon.phone);
      setSalonEmail(salon.email);
    }
    setShowSalonModal(true);
  };

  const handleOpenServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.name);
      setServiceDescription(service.description);
      setServiceDuration(service.duration_minutes.toString());
      setServicePrice(service.price.toString());
    } else {
      setEditingService(null);
      setServiceName('');
      setServiceDescription('');
      setServiceDuration('60');
      setServicePrice('0');
    }
    setShowServiceModal(true);
  };

  const handleCreateOrUpdateService = async () => {
    if (!salon) return;

    const serviceData = {
      salon_id: salon.id,
      name: serviceName,
      description: serviceDescription,
      duration_minutes: parseInt(serviceDuration),
      price: parseFloat(servicePrice),
    };

    if (editingService) {
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingService.id);

      if (!error) {
        setShowServiceModal(false);
        fetchServices(salon.id);
      }
    } else {
      const { error } = await supabase.from('services').insert(serviceData);

      if (!error) {
        setShowServiceModal(false);
        fetchServices(salon.id);
      }
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!salon) return;

    const { error } = await supabase.from('services').delete().eq('id', serviceId);

    if (!error) {
      fetchServices(salon.id);
    }
  };

  return (
    <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#2D2D2D" strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Manage Salon</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : !salon ? (
          <View style={styles.emptyContainer}>
            <Store size={64} color="#FFD4E5" strokeWidth={1.5} />
            <Text style={styles.emptyText}>No salon created yet</Text>
            <Pressable style={styles.primaryButton} onPress={handleOpenSalonModal}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.primaryButtonText}>Create Salon</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.salonCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.salonName}>{salon.name}</Text>
                <Pressable onPress={handleOpenSalonModal}>
                  <Edit2 size={20} color="#FF6B9D" strokeWidth={2} />
                </Pressable>
              </View>
              <Text style={styles.salonDescription}>{salon.description}</Text>
              <Text style={styles.salonMeta}>{salon.address}</Text>
              <Text style={styles.salonMeta}>{salon.phone}</Text>
            </View>

            <View style={styles.servicesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Services</Text>
                <Pressable
                  style={styles.addButton}
                  onPress={() => handleOpenServiceModal()}
                >
                  <Plus size={20} color="#FFFFFF" strokeWidth={2} />
                </Pressable>
              </View>

              {services.length === 0 ? (
                <Text style={styles.emptyText}>No services added yet</Text>
              ) : (
                services.map((service) => (
                  <View key={service.id} style={styles.serviceCard}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                      <View style={styles.serviceMeta}>
                        <Text style={styles.serviceMetaText}>{service.duration_minutes} min</Text>
                        <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
                      </View>
                    </View>

                    <View style={styles.serviceActions}>
                      <Pressable onPress={() => handleOpenServiceModal(service)}>
                        <Edit2 size={18} color="#FF6B9D" strokeWidth={2} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteService(service.id)}>
                        <Trash2 size={18} color="#FF4757" strokeWidth={2} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showSalonModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSalonModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{salon ? 'Edit Salon' : 'Create Salon'}</Text>
            <Pressable onPress={() => setShowSalonModal(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Salon Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter salon name"
              placeholderTextColor="#CCCCCC"
              value={salonName}
              onChangeText={setSalonName}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your salon"
              placeholderTextColor="#CCCCCC"
              value={salonDescription}
              onChangeText={setSalonDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter address"
              placeholderTextColor="#CCCCCC"
              value={salonAddress}
              onChangeText={setSalonAddress}
            />

            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#CCCCCC"
              value={salonPhone}
              onChangeText={setSalonPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              placeholderTextColor="#CCCCCC"
              value={salonEmail}
              onChangeText={setSalonEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Pressable style={styles.confirmButton} onPress={handleCreateOrUpdateSalon}>
              <Text style={styles.confirmButtonText}>{salon ? 'Update Salon' : 'Create Salon'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showServiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add Service'}</Text>
            <Pressable onPress={() => setShowServiceModal(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Service Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Haircut, Coloring"
              placeholderTextColor="#CCCCCC"
              value={serviceName}
              onChangeText={setServiceName}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe this service"
              placeholderTextColor="#CCCCCC"
              value={serviceDescription}
              onChangeText={setServiceDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="60"
              placeholderTextColor="#CCCCCC"
              value={serviceDuration}
              onChangeText={setServiceDuration}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Price ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#CCCCCC"
              value={servicePrice}
              onChangeText={setServicePrice}
              keyboardType="decimal-pad"
            />

            <Pressable style={styles.confirmButton} onPress={handleCreateOrUpdateService}>
              <Text style={styles.confirmButtonText}>
                {editingService ? 'Update Service' : 'Add Service'}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
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
    marginBottom: 24,
  },
  salonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  salonName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  salonDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 12,
  },
  salonMeta: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  servicesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  addButton: {
    backgroundColor: '#FF6B9D',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceMetaText: {
    fontSize: 13,
    color: '#999999',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2D2D',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: '#FFD4E5',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#2D2D2D',
  },
  textArea: {
    minHeight: 100,
  },
  confirmButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
