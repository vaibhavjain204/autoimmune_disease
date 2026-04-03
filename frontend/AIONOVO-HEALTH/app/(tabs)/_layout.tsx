import { Drawer } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function CustomDrawer() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  };

  const Item = ({ label, path }: any) => (
    <TouchableOpacity onPress={() => router.push(path)}>
      <Text style={styles.item}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AIONOVA</Text>

      <Item label="Home" path="/(tabs)" />
      <Item label="Profile" path="/(tabs)/profile" />
      <Item label="Symptom Checker" path="/(tabs)/symptom" />
      <Item label="Lab Test" path="/(tabs)/labtest" />
      {/* <Item label="Medical History" path="/(tabs)/history" /> */}
      <Item label="Treatment" path="/(tabs)/treatment" />
      <Item label="Results" path="/(tabs)/results" />
      <Item label="Settings" path="/(tabs)/settings" />

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Layout() {
  return (
    <Drawer
      screenOptions={{ headerShown: false }}
      drawerContent={() => <CustomDrawer />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f3f0f7' },
  logo: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#4a4a8a' },
  item: { fontSize: 16, marginVertical: 10 },
  logout: { marginTop: 'auto', backgroundColor: '#6c63ff', padding: 12, borderRadius: 10 },
  logoutText: { color: '#fff', textAlign: 'center' },
});