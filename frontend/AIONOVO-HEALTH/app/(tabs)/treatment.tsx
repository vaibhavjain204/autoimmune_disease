import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import Header from '../components/Header';

export default function Treatment() {
  const navigation = useNavigation();

  // Example treatment suggestions for Lupus and RA
  const treatments = {
    lupus: [
      { level: 'Basic', advice: 'Maintain a healthy lifestyle, avoid sun exposure, take vitamin D supplements.' },
      { level: 'Intermediate', advice: 'Medications: NSAIDs for pain, antimalarials like Hydroxychloroquine.' },
      { level: 'Advanced', advice: 'Immunosuppressants for severe cases (Cyclophosphamide, Mycophenolate).' },
    ],
    ra: [
      { level: 'Basic', advice: 'Rest, gentle exercises, physical therapy, and healthy diet.' },
      { level: 'Intermediate', advice: 'Medications: NSAIDs, corticosteroids for inflammation control.' },
      { level: 'Advanced', advice: 'DMARDs (Methotrexate, Leflunomide) and biologics for severe RA.' },
    ],
  };

  return (
    <View style={styles.container}>
      <Header title="Treatment" navigation={navigation} />

      <ScrollView>
        {/* Lupus Treatment Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lupus Treatment 💜</Text>
          {treatments.lupus.map((treatment, index) => (
            <View key={index} style={styles.treatmentStep}>
              <Text style={styles.level}>{treatment.level}:</Text>
              <Text style={styles.advice}>{treatment.advice}</Text>
            </View>
          ))}
        </View>

        {/* RA Treatment Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rheumatoid Arthritis Treatment 🤲</Text>
          {treatments.ra.map((treatment, index) => (
            <View key={index} style={styles.treatmentStep}>
              <Text style={styles.level}>{treatment.level}:</Text>
              <Text style={styles.advice}>{treatment.advice}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  treatmentStep: { marginBottom: 10 },
  level: { fontWeight: '600' },
  advice: { marginLeft: 10 },
});