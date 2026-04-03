import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import Header from '../components/Header';
import { useState } from 'react';

type ProfileUser = {
  age: string;
  email: string;
  gender: string;
  name: string;
};

export default function Profile() {
  const navigation = useNavigation();

  const [user, setUser] = useState<ProfileUser>({
    name: 'John Doe',
    email: 'user@gmail.com',
    age: '25',
    gender: 'Male',
  });

  const handleChange = (field: keyof ProfileUser, value: string) => {
    setUser({ ...user, [field]: value });
  };

  const handleSave = () => {
    // Connect to backend or AsyncStorage here
    alert('Profile Saved Successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="Profile" navigation={navigation} />

      <View style={styles.card}>
        <Text style={styles.title}>                          Profile 👤</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={user.name}
          onChangeText={(text) => handleChange('name', text)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={user.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={user.age}
          onChangeText={(text) => handleChange('age', text)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          value={user.gender}
          onChangeText={(text) => handleChange('gender', text)}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f7' },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  label: { marginTop: 10, fontWeight: '600' },
  input: {
    backgroundColor: '#f3f0f7',
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#6a5acd',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});
