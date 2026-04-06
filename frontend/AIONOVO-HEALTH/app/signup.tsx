import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getApiUrl } from '@/constants/api';
import { saveSession } from '@/utils/session';

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      if (!email.includes('@')) {
        Alert.alert('Invalid Email', 'Enter a valid email address.');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Password too short', 'Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Passwords do not match');
        return;
      }

      setLoading(true);

      const response = await fetch(getApiUrl('/auth/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed.');
      }

      await saveSession({
        token: data.token,
        user: data.user,
      });
      Alert.alert('Account Created', 'Your account is now stored in the backend database.');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Signup failed', error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>AIONOVA HEALTH</Text>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#8b86a3"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#8b86a3"
          style={styles.input}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#8b86a3"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#8b86a3"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/login')}>
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f0f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#e6def2',
    borderRadius: 25,
    padding: 25,
    elevation: 6,
  },
  logo: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4a4a8a',
    marginBottom: 10,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    color: '#222',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#6c63ff',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 15,
  },
  link: {
    color: '#6c63ff',
    fontWeight: '600',
  },
});
