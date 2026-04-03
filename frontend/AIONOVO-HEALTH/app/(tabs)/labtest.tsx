import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Header from '../components/Header';

export default function LabTest() {
  const navigation = useNavigation();
  const router = useRouter();

  const [form, setForm] = useState({
    age: '',
    ESR: '',
    CRP: '',
    RF: '',
    C3: '',
    C4: '',
    gender: '',
    antiCCP: '',
    HLAB27: '',
    ANA: '',
    antiRo: '',
    antiLa: '',
    antiDsDNA: '',
    antiSm: '',
  });

  const handleFloatInput = (key: string, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setForm({ ...form, [key]: value });
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handlePredict = () => {
    const requiredValues = [
      form.age,
      form.ESR,
      form.CRP,
      form.RF,
      form.C3,
      form.C4,
      form.gender,
      form.antiCCP,
      form.HLAB27,
      form.ANA,
      form.antiRo,
      form.antiLa,
      form.antiDsDNA,
      form.antiSm,
    ];

    if (requiredValues.some((value) => !value)) {
      alert('Please fill all lab test fields before predicting.');
      return;
    }

    router.push({
      pathname: '/(tabs)/results',
      params: form,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Lab Test Input" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Enter Lab Values</Text>

        <View style={styles.field}>
          <Text>Age</Text>
          <TextInput
            value={form.age}
            style={styles.input}
            placeholder="Enter value"
            keyboardType="numeric"
            onChangeText={(value) => handleFloatInput('age', value)}
          />
        </View>

        <View style={styles.field}>
          <Text>ESR</Text>
          <TextInput
            value={form.ESR}
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(value) => handleFloatInput('ESR', value)}
          />
        </View>

        <View style={styles.field}>
          <Text>CRP</Text>
          <TextInput
            value={form.CRP}
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(value) => handleFloatInput('CRP', value)}
          />
        </View>

        <View style={styles.field}>
          <Text>RF</Text>
          <TextInput
            value={form.RF}
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(value) => handleFloatInput('RF', value)}
          />
        </View>

        <View style={styles.field}>
          <Text>C3</Text>
          <TextInput
            value={form.C3}
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(value) => handleFloatInput('C3', value)}
          />
        </View>

        <View style={styles.field}>
          <Text>C4</Text>
          <TextInput
            value={form.C4}
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(value) => handleFloatInput('C4', value)}
          />
        </View>

        <View style={styles.field}>
          <Text>Gender</Text>
          <View style={styles.dropdown}>
            <Picker
              selectedValue={form.gender}
              onValueChange={(value) => handleChange('gender', value)}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>

        <View style={styles.field}>
          <Text>Anti-CCP</Text>
          <View style={styles.dropdown}>
            <Picker
              selectedValue={form.antiCCP}
              onValueChange={(value) => handleChange('antiCCP', value)}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Positive" value="Positive" />
              <Picker.Item label="Negative" value="Negative" />
            </Picker>
          </View>
        </View>

        {[
          { label: 'HLA-B27', key: 'HLAB27' },
          { label: 'ANA', key: 'ANA' },
          { label: 'Anti-Ro', key: 'antiRo' },
          { label: 'Anti-La', key: 'antiLa' },
          { label: 'Anti-dsDNA', key: 'antiDsDNA' },
          { label: 'Anti-Sm', key: 'antiSm' },
        ].map((item) => (
          <View key={item.key} style={styles.field}>
            <Text>{item.label}</Text>
            <View style={styles.dropdown}>
              <Picker
                selectedValue={form[item.key as keyof typeof form]}
                onValueChange={(value) => handleChange(item.key, value)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Positive" value="Positive" />
                <Picker.Item label="Negative" value="Negative" />
              </Picker>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handlePredict}>
          <Text style={styles.buttonText}>Predict Result</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f0f7' },
  body: { padding: 20 },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  field: {
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#6c63ff',
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
