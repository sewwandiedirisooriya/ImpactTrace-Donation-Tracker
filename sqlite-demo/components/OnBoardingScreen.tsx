import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  features: string[];
}

const roles: RoleOption[] = [
  {
    id: 'ngo_admin',
    title: 'NGO Admin Panel',
    description: 'Manage projects with predictive analytics, smart application processing, and automated insights.',
    icon: 'people',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    features: ['Predictive Analytics', 'Auto_Prioritization', 'Smart Reporting'],
  },
  {
    id: 'donation_tracking',
    title: 'Donation Tracking',
    description: 'Log donations with photo capture, automatic categorization, and real-time tracking',
    icon: 'gift',
    color: '#10B981',
    bgColor: '#ECFDF5',
    features: ['Photo Logging', 'Live Tracking', 'Smart Search'],
  },
  {
    id: 'donor_portal',
    title: 'Donor Portal',
    description: 'Browse projects, make donations, and track your impact with offline capabilities.',
    icon: 'heart',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    features: ['Offline Access', 'Impact Tracking', 'Real Updates'],
  },
  {
    id: 'beneficiary_portal',
    title: 'Beneficiary Portal',
    description: 'Apply for aid with voice input support, track applications, and provide feedback.',
    icon: 'person',
    color: '#A855F7',
    bgColor: '#FAF5FF',
    features: ['Voice Support', 'Status Tracking', 'Easy Access'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const handleNext = () => {
    // Navigate to role selection screen
    router.push('/role-selection');
  };

  const renderRoleCard = (role: RoleOption) => (
    <View
      key={role.id}
      style={[styles.roleCard, { backgroundColor: role.bgColor }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: role.color }]}>
          <Ionicons name={role.icon as any} size={32} color="#FFF" />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{role.title}</Text>
          <Text style={styles.cardDescription}>{role.description}</Text>
        </View>
      </View>
      <View style={styles.featuresContainer}>
        {role.features.map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to ImpactTrace</Text>
        <Text style={styles.subtitle}>
          Track donations, empower change, and make a difference
        </Text>
        <Text style={styles.description}>
          ImpactTrace adapts to your needs. Explore the different roles available to get started.
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {roles.map(renderRoleCard)}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  roleCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#A855F7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});