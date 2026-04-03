import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import Header from '../components/Header';

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header title="AIONOVA HEALTH" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.body}>

        {/* Welcome */}
        <Text style={styles.welcome}>Welcome 👋</Text>

        {/* App Intro Card */}
        <View style={styles.card}>
          <Text style={styles.title}>AI Health Detection 🧠</Text>

          <Text style={styles.desc}>
            Our app helps detect possible diseases like:
          </Text>

          <Text style={styles.list}>
            • Healthy ✅{'\n'}
            • Lupus ⚠️{'\n'}
            • Rheumatoid Arthritis (RA) ⚠️
          </Text>

          <Text style={styles.desc}>
            Based on your symptoms and medical data, we predict:
          </Text>

          <Text style={styles.list}>
            • Disease probability (%){"\n"}
            • Possible health risks{"\n"}
            • Smart suggestions
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/userinfo')}
        >
          <Text style={styles.buttonText}>Start Checkup</Text>
        </TouchableOpacity>

        {/* Start Over
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.secondaryText}>Start Over</Text>
        </TouchableOpacity> */}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f0f7',
  },

  body: {
    padding: 20,
  },

  welcome: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#e6def2',
    padding: 20,
    borderRadius: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },

  desc: {
    marginTop: 8,
    color: '#555',
  },

  list: {
    marginTop: 8,
    marginLeft: 5,
    color: '#333',
  },

  button: {
    backgroundColor: '#6c63ff',
    padding: 14,
    borderRadius: 12,
    marginTop: 25,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },

  secondaryButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#6c63ff',
  },

  secondaryText: {
    color: '#6c63ff',
    textAlign: 'center',
    fontWeight: '600',
  },
});