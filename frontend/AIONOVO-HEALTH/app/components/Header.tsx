import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Header({ title, navigation }: any) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Text style={styles.menu}>☰</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
        <Text style={styles.profile}>👤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e6def2',
    padding: 15,
    marginTop: 30,
  },
  menu: {
    fontSize: 22,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a4a8a',
  },
  profile: {
    fontSize: 20,
  },
});