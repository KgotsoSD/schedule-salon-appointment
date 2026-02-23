import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Scissors } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Scissors size={64} color="#FF6B9D" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Salon Booking</Text>
        <Text style={styles.subtitle}>Book your perfect salon appointment anytime, anywhere</Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/(auth)/signin')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  secondaryButtonText: {
    color: '#FF6B9D',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
