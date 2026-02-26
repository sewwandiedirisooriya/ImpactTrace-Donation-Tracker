// app/layouts/DonorTabLayout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DonorTabLayout() {
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
        name="donor-home" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="donor-projects" 
        options={{ 
          title: 'Discover Projects',
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="donor-impact" 
        options={{ 
          title: 'My Impact',
          tabBarLabel: 'Impact',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }} 
      />
      {/* Hide all tabs that are not relevant for donors */}
      <Tabs.Screen 
        name="donor-updates" 
       options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="reports" 
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
        name="applications" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="beneficiary-home" 
        options={{ 
          href: null,
        }}  
      />
      <Tabs.Screen 
        name="beneficiary" 
        options={{ 
          href: null,
        }}  
      />
      <Tabs.Screen 
        name="application-history" 
        options={{ 
          href: null,
        }}  
      />
    </Tabs>
  );
}
