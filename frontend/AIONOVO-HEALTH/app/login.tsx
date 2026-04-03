import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getApiUrl } from '@/constants/api';
import { saveSession } from '@/utils/session';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Missing details', 'Enter your email and password.');
        return;
      }

      setLoading(true);

      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed.');
      }

      await saveSession({
        token: data.token,
        user: data.user,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>AIONOVA HEALTH</Text>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          placeholder="Email Address"
          style={styles.input}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Do not have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/signup')}>
            Sign Up
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
