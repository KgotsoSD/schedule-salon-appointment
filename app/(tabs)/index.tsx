import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_SALON } from '@/lib/mockData';
import { MapPin, Clock, Scissors } from 'lucide-react-native';

type Salon = {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  image_url: string | null;
  opening_time: string;
  closing_time: string;
};

export default function HomeScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  const isSalonOwner = profile?.role === 'salon_owner';

  useEffect(() => {
    fetchSalon();
  }, []);

  const fetchSalon = async () => {
    if (!isSupabaseConfigured()) {
      setSalon(MOCK_SALON as Salon);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      setSalon(data);
    } else {
      setSalon(MOCK_SALON as Salon);
    }
    setLoading(false);
  };

  if (isSalonOwner) {
    return (
      <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{profile?.full_name || 'Salon Owner'}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Scissors size={48} color="#FF6B9D" strokeWidth={1.5} />
            <Text style={styles.cardTitle}>Manage Your Salon</Text>
            <Text style={styles.cardText}>
              Set up your salon, add services, and manage bookings from the tabs below.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.manageButton,
                pressed && styles.manageButtonPressed,
              ]}
              onPress={() => router.push('/manage-salon')}
            >
              <Text style={styles.manageButtonText}>Manage Salon</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.name}>{profile?.full_name || 'Beautiful'}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : !salon ? (
          <View style={styles.emptyContainer}>
            <Scissors size={64} color="#FFD4E5" strokeWidth={1.5} />
            <Text style={styles.emptyText}>Salon coming soon</Text>
            <Text style={styles.emptySubtext}>Check back later for booking</Text>
          </View>
        ) : (
          <View style={styles.salonCard}>
            <View style={styles.salonImageContainer}>
              {salon.image_url ? (
                <Image source={{ uri: salon.image_url }} style={styles.salonImage} />
              ) : (
                <View style={[styles.salonImage, styles.salonImagePlaceholder]}>
                  <Scissors size={48} color="#FF6B9D" strokeWidth={1.5} />
                </View>
              )}
            </View>
            <View style={styles.salonInfo}>
              <Text style={styles.salonName}>{salon.name}</Text>
              <Text style={styles.salonDescription} numberOfLines={3}>
                {salon.description || 'Book your appointment with us.'}
              </Text>
              <View style={styles.salonMeta}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color="#666666" strokeWidth={2} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {salon.address || 'Location not set'}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#666666" strokeWidth={2} />
                  <Text style={styles.metaText}>
                    {salon.opening_time.slice(0, 5)} - {salon.closing_time.slice(0, 5)}
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.bookButton,
                pressed && styles.bookButtonPressed,
              ]}
              onPress={() => router.push({ pathname: '/salon/[id]/book', params: { id: salon.id } })}
            >
              <Text style={styles.bookButtonText}>Book appointment</Text>
            </Pressable>
          </View>
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
  greeting: {
    fontSize: 16,
    color: '#666666',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
    marginTop: 4,
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
  },
  salonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  salonImageContainer: {
    width: '100%',
    height: 180,
  },
  salonImage: {
    width: '100%',
    height: '100%',
  },
  salonImagePlaceholder: {
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  salonInfo: {
    padding: 20,
  },
  salonName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 6,
  },
  salonDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  salonMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#666666',
    flex: 1,
  },
  bookButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2D2D',
    marginTop: 16,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  manageButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 20,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  manageButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
