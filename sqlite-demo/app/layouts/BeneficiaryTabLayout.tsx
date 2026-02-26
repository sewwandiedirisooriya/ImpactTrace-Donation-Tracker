// app/layouts/BeneficiaryTabLayout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BeneficiaryTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0288d1',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: { 
          paddingBottom: 15, 
          paddingTop: 5, 
          height: 65,
          marginBottom: 35,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen 
        name="beneficiary-home" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="beneficiary" 
        options={{ 
          title: 'My Applications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="application-history" 
        options={{ 
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }} 
      />
      {/* Hide tabs that are not relevant for beneficiaries */}
      <Tabs.Screen 
        name="reports" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="home" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="admin" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="ai-insights" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="applications" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="donor-home" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="donor-projects" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="donor-impact" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="donor-updates" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}
