import { Tabs } from 'expo-router';
import { Home, Calendar, User, Store } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { profile } = useAuth();
  const isSalonOwner = profile?.role === 'salon_owner';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B9D',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#FFE5E5',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      {isSalonOwner ? (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'My Salon',
              tabBarIcon: ({ size, color }) => (
                <Store size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
          <Tabs.Screen
            name="bookings"
            options={{
              title: 'Bookings',
              tabBarIcon: ({ size, color }) => (
                <Calendar size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ size, color }) => (
                <User size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ size, color }) => (
                <Home size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
          <Tabs.Screen
            name="bookings"
            options={{
              title: 'My Bookings',
              tabBarIcon: ({ size, color }) => (
                <Calendar size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ size, color }) => (
                <User size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
        </>
      )}
    </Tabs>
  );
}
