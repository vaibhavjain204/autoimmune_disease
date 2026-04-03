import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!email.includes('@gmail.com')) {
      Alert.alert('Invalid Email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password too short');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    await AsyncStorage.setItem('user', JSON.stringify({ email, password }));

    Alert.alert('Account Created!');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.logo}>AIONOVA HEALTH</Text>
        <Text style={styles.title}>Create Account 🚀</Text>

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

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
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

/*
Signup UI with same theme and improved UX
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