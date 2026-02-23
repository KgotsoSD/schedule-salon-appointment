import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, Mail, LogOut, Edit2, Save } from 'lucide-react-native';

export default function ProfileScreen() {
  const { profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateProfile({
      full_name: fullName,
      phone: phone,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setEditing(false);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <LinearGradient colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Pressable
          style={styles.editButton}
          onPress={() => {
            if (editing) {
              handleSave();
            } else {
              setEditing(true);
            }
          }}
        >
          {editing ? (
            <Save size={24} color="#FF6B9D" strokeWidth={2} />
          ) : (
            <Edit2 size={24} color="#FF6B9D" strokeWidth={2} />
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={48} color="#FF6B9D" strokeWidth={1.5} />
          </View>
          <Text style={styles.roleBadge}>
            {profile?.role === 'salon_owner' ? 'Salon Owner' : 'Customer'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoSection}>
            <View style={styles.iconLabel}>
              <User size={18} color="#666666" strokeWidth={2} />
              <Text style={styles.label}>Full Name</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#CCCCCC"
              />
            ) : (
              <Text style={styles.value}>{profile?.full_name || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.iconLabel}>
              <Mail size={18} color="#666666" strokeWidth={2} />
              <Text style={styles.label}>Email</Text>
            </View>
            <Text style={styles.value}>{profile?.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.iconLabel}>
              <Phone size={18} color="#666666" strokeWidth={2} />
              <Text style={styles.label}>Phone</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#CCCCCC"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{profile?.phone || 'Not set'}</Text>
            )}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#FF4757" strokeWidth={2} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  roleBadge: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
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
  infoSection: {
    paddingVertical: 12,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  value: {
    fontSize: 16,
    color: '#2D2D2D',
    paddingLeft: 26,
  },
  input: {
    fontSize: 16,
    color: '#2D2D2D',
    paddingLeft: 26,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD4E5',
  },
  divider: {
    height: 1,
    backgroundColor: '#FFE5E5',
    marginVertical: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF4757',
    marginBottom: 32,
  },
  signOutText: {
    color: '#FF4757',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
