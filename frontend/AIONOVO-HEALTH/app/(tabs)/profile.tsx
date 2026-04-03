import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'expo-router';

import { getApiUrl } from '@/constants/api';
import Header from '../components/Header';
import type { UserProfile } from '@/types/auth';
import { getSession, saveSession } from '@/utils/session';

type ProfileForm = {
  age: string;
  email: string;
  gender: string;
  id: string;
  name: string;
};

export default function Profile() {
  const navigation = useNavigation();
  const [user, setUser] = useState<ProfileForm>({
    name: '',
    email: '',
    age: '',
    gender: '',
    id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setUser({ ...user, [field]: value });
  };

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const session = await getSession();
        if (!session) {
          return;
        }

        const response = await fetch(getApiUrl('/auth/me'), {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const data = await response.json();
        const backendUser = response.ok ? (data.user as UserProfile) : session.user;

        if (active) {
          setUser({
            id: backendUser.id,
            name: backendUser.name ?? '',
            email: backendUser.email ?? '',
            age: backendUser.age ?? '',
            gender: backendUser.gender ?? '',
          });
        }
      } catch {
        const session = await getSession();
        if (active && session) {
          setUser({
            id: session.user.id,
            name: session.user.name ?? '',
            email: session.user.email ?? '',
            age: session.user.age ?? '',
            gender: session.user.gender ?? '',
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      const session = await getSession();
      if (!session) {
        Alert.alert('Not logged in', 'Please log in again.');
        return;
      }

      setSaving(true);
      const response = await fetch(getApiUrl('/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          name: user.name,
          age: user.age,
          gender: user.gender,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile.');
      }

      await saveSession({
        token: session.token,
        user: data.user,
      });
      Alert.alert('Profile Saved', 'Your profile was updated in the database.');
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="Profile" navigation={navigation} />

      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>

        {loading ? (
          <Text style={styles.infoText}>Loading profile...</Text>
        ) : (
          <>
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
              editable={false}
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

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Text>
            </TouchableOpacity>
          </>
        )}
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
  infoText: {
    marginTop: 12,
    color: '#555',
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
