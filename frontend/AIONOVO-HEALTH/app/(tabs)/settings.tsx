import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import Header from '../components/Header';

export default function Settings() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Header title="Settings" navigation={navigation} />

      <View style={styles.card}>
        <Text>App Settings ⚙️</Text>
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
});