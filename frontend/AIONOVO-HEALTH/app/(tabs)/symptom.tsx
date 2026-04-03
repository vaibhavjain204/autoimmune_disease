import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import Header from '../components/Header';
import { useState } from 'react';

export default function Symptom() {
  const navigation = useNavigation();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);

  // Add symptom
  const addSymptom = () => {
    if (!input) return;

    setSymptoms([...symptoms, input]);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <Header title="Symptom Checker" navigation={navigation} />

      <View style={styles.card}>
        <Text style={styles.title}>Enter your symptoms 🤒</Text>

        {/* Input */}
        <TextInput
          placeholder="e.g. Fever, Joint Pain"
          style={styles.input}
          value={input}
          onChangeText={setInput}
        />

        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={addSymptom}>
          <Text style={styles.addText}>Add Symptom</Text>
        </TouchableOpacity>

        {/* List */}
        <FlatList
          data={symptoms}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.symptomItem}>
              <Text>{item}</Text>
            </View>
          )}
        />

        {/* Next Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (symptoms.length === 0) {
              alert("Please add at least one symptom");
              return;
            }

            router.push('/(tabs)/labtest');
          }}
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
    padding: 20,
    margin: 20,
    borderRadius: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  addBtn: {
    backgroundColor: '#4a4a8a',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  addText: {
    color: '#fff',
    textAlign: 'center',
  },

  symptomItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
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