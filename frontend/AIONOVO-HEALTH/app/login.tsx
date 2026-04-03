import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const storedUser = await AsyncStorage.getItem('user');

    if (!storedUser) {
      Alert.alert('No Account', 'Please sign up first');
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.email === email && user.password === password) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Invalid Credentials');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.logo}>AIONOVA HEALTH</Text>
        <Text style={styles.title}>Welcome Back 👋</Text>

        <TextInput
          placeholder="Email Address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.forgot}>Forgot Password?</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Don’t have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/signup')}>
            Sign Up
          </Text>
        </Text>

      </View>
    </View>
  );
}

/*
Same theme UI with improved spacing and clean layout
*/

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
  forgot: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 12,
    color: '#6c63ff',
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