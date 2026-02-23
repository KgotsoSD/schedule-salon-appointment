import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Clock, DollarSign, Scissors } from 'lucide-react-native';

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
  const [salons, setSalons] = useState<Salon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const isSalonOwner = profile?.role === 'salon_owner';

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setSalons(data);
    }
    setLoading(false);
  };

  const filteredSalons = salons.filter(salon =>
    salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <View style={styles.searchContainer}>
        <Search size={20} color="#999999" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search salons..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Find Your Perfect Salon</Text>

        {loading ? (
          <Text style={styles.emptyText}>Loading salons...</Text>
        ) : filteredSalons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Scissors size={64} color="#FFD4E5" strokeWidth={1.5} />
            <Text style={styles.emptyText}>No salons available yet</Text>
            <Text style={styles.emptySubtext}>Check back soon for available salons</Text>
          </View>
        ) : (
          filteredSalons.map((salon) => (
            <Pressable
              key={salon.id}
              style={({ pressed }) => [
                styles.salonCard,
                pressed && styles.salonCardPressed,
              ]}
              onPress={() => router.push(`/salon/${salon.id}`)}
            >
              <View style={styles.salonImageContainer}>
                {salon.image_url ? (
                  <Image source={{ uri: salon.image_url }} style={styles.salonImage} />
                ) : (
                  <View style={[styles.salonImage, styles.salonImagePlaceholder]}>
                    <Scissors size={40} color="#FF6B9D" strokeWidth={1.5} />
                  </View>
                )}
              </View>

              <View style={styles.salonInfo}>
                <Text style={styles.salonName}>{salon.name}</Text>
                <Text style={styles.salonDescription} numberOfLines={2}>
                  {salon.description || 'Professional hair salon services'}
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
            </Pressable>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD4E5',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D2D2D',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 16,
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
  salonCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
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
    padding: 16,
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
