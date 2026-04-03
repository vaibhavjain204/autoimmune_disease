import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.logo}>AIONOVA HEALTH</Text>

        <Text style={styles.title}>Welcome 👋</Text>
        <Text style={styles.subtitle}>
          Your health, our priority
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.secondaryText}>Sign Up</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

/*
Main screen with same theme and clean layout.
Navigation to login & signup.
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
    padding: 30,
    alignItems: 'center',
    elevation: 6,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a4a8a',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    marginTop: 5,
    marginBottom: 30,
    color: '#555',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6c63ff',
    padding: 14,
    width: '100%',
    borderRadius: 12,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6c63ff',
  },
  secondaryText: {
    color: '#6c63ff',
    textAlign: 'center',
    fontWeight: '600',
  },
});