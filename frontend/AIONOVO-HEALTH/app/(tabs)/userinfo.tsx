import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import Header from '../components/Header';

export default function UserInfo() {
  const navigation = useNavigation();
  const router = useRouter();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  return (
    <View style={styles.container}>
      <Header title="Basic Info" navigation={navigation} />

      <View style={styles.card}>
        <Text style={styles.title}>Enter Your Details</Text>

        <TextInput
          placeholder="Name"
          placeholderTextColor="#8b86a3"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Age"
          placeholderTextColor="#8b86a3"
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <TextInput
          placeholder="Gender"
          placeholderTextColor="#8b86a3"
          style={styles.input}
          value={gender}
          onChangeText={setGender}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/symptom')}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f7' },

  card: {
    backgroundColor: '#e6def2',
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },

  input: {
    backgroundColor: '#fff',
    color: '#222',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  button: {
    backgroundColor: '#6c63ff',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
