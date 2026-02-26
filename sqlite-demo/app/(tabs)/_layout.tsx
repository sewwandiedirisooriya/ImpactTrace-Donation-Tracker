// app/(tabs)/_layout.tsx
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getUserRole } from '../../Utils/auth';
import AdminTabLayout from '../layouts/AdminTabLayout';
import DonorTabLayout from '../layouts/DonorTabLayout';
import BeneficiaryTabLayout from '../layouts/BeneficiaryTabLayout';

export default function TabLayout() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const role = await getUserRole();
      setUserRole(role);
    } catch (error) {
      console.error('Error loading user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading indicator while fetching role
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0288d1" />
      </View>
    );
  }

  // Render the appropriate tab layout based on user role
  switch (userRole) {
    case 'admin':
      return <AdminTabLayout />;
    case 'donor':
      return <DonorTabLayout />;
    case 'beneficiary':
      return <BeneficiaryTabLayout />;
    default:
      // Default to donor layout if role is not recognized
      return <DonorTabLayout />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});