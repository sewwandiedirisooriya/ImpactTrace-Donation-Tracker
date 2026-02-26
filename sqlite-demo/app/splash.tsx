import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home'); // fixed path
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/Donation-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Donation Tracker</Text>
      <Text style={styles.subtitle}>Track Giving. Empower Change</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4fc3f7' },
  logo: { width: 300, height: 300, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#9D00BC' },
  subtitle: { fontSize: 16, color: '#9D00BC', fontStyle: 'italic' },
});
