import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'salon_owner'>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <LinearGradient
      colors={['#FFE5E5', '#FFF0F0', '#FFFFFF']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#2D2D2D" />
          </Pressable>

          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us today</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#CCCCCC"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#CCCCCC"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor="#CCCCCC"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.roleContainer}>
              <Text style={styles.label}>I am a:</Text>
              <View style={styles.roleButtons}>
                <Pressable
                  style={[
                    styles.roleButton,
                    role === 'customer' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('customer')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === 'customer' && styles.roleButtonTextActive,
                  ]}>
                    Customer
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.roleButton,
                    role === 'salon_owner' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('salon_owner')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === 'salon_owner' && styles.roleButtonTextActive,
                  ]}>
                    Salon Owner
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push('/(auth)/signin')}>
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkBold}>Sign In</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    padding: 16,
    marginTop: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  errorText: {
    color: '#FF4757',
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#FFE5E9',
    padding: 12,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD4E5',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#2D2D2D',
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD4E5',
  },
  roleButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  roleButtonText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
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
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
  },
  linkBold: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
});
