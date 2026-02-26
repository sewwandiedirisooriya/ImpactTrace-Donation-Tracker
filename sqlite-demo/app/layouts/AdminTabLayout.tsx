// app/layouts/AdminTabLayout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminTabLayout() {
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
        name="home" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="admin" 
        options={{ 
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="ai-insights" 
        options={{ 
          title: 'AI-Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen
        name="applications" 
        options={{ 
          title: 'Applications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="reports" 
        options={{ 
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }} 
      />
      {/* Hide tabs that are not relevant for admin */}
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
