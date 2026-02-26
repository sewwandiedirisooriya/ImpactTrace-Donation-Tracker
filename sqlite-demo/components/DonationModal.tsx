import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { getCurrentUser } from '../Utils/auth';

interface DonationModalProps {
  visible: boolean;
  onClose: () => void;
  project: {
    id: number;
    title?: string;
    name?: string;
    description: string;
    category?: string;
    target_amount: number;
    collected_amount?: number;
    current_amount?: number;
  };
  onDonationSuccess?: () => void;
}

export default function DonationModal({ visible, onClose, project, onDonationSuccess }: DonationModalProps) {
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [amount, setAmount] = useState('1000');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const quickAmounts = [500, 1000, 10000];
  const projectTitle = project.title || project.name || 'Project';

  // Load current user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setDonorName(user.name);
          setDonorEmail(user.email);
          // Note: We need to get the user ID from the backend after login
          // For now, we'll need to get it from storage or make an API call
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUserId(parsedUser.id || null);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    if (visible) {
      loadUserData();
    }
  }, [visible]);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const calculateImpact = () => {
    const donationAmount = parseFloat(amount) || 0;
    if (project.category?.toLowerCase().includes('food') || project.category?.toLowerCase().includes('emergency')) {
      const meals = Math.floor(donationAmount / 50);
      return { value: meals, label: 'Meals', conversion: 'LKR 50 = 1 meal' };
    } else if (project.category?.toLowerCase().includes('education')) {
      const books = Math.floor(donationAmount / 100);
      return { value: books, label: 'Books', conversion: 'LKR 100 = 1 book' };
    } else if (project.category?.toLowerCase().includes('health')) {
      const treatments = Math.floor(donationAmount / 500);
      return { value: treatments, label: 'Treatments', conversion: 'LKR 500 = 1 treatment' };
    }
    return { value: Math.floor(donationAmount / 100), label: 'People Helped', conversion: 'LKR 100 = 1 person' };
  };

  const handleDonate = async () => {
    // Validation
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Please log in to make a donation',
        position: 'top',
      });
      return;
    }

    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid donation amount',
        position: 'top',
      });
      return;
    }

    setLoading(true);

    try {
      const donationData = {
        project_id: project.id,
        donor_id: userId,
        amount: donationAmount,
        currency: 'LKR',
        purpose: purpose.trim() || `Donation for ${projectTitle}`,
      };

      const response = await apiService.createDonation(donationData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: `Thank you for your donation of LKR ${donationAmount}`,
          position: 'top',
          visibilityTime: 4000,
        });

        // Reset form
        setAmount('1000');
        setPurpose('');

        // Call success callback
        if (onDonationSuccess) {
          onDonationSuccess();
        }

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to process donation');
      }
    } catch (error: any) {
      console.error('Donation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Donation Failed',
        text2: error.message || 'Failed to process donation. Please try again.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const impact = calculateImpact();
  const donationsToGold = 3 - (Math.floor(Math.random() * 2)); // Mock data

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Make Donation</Text>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Donor Level Badge */}
            <View style={styles.donorLevelCard}>
              <View style={styles.donorLevelHeader}>
                <Ionicons name="star" size={32} color="#FFD700" />
                <View style={styles.donorLevelText}>
                  <Text style={styles.donorLevelTitle}>Gold Donor Level</Text>
                  <Text style={styles.donorLevelSubtitle}>
                    {donationsToGold} more donations to reach platinum status
                  </Text>
                </View>
              </View>
            </View>

            {/* Project Info */}
            <View style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Ionicons name="fast-food" size={24} color="#FF6347" />
                <Text style={styles.projectTitle}>{projectTitle}</Text>
              </View>
              <Text style={styles.projectDescription} numberOfLines={2}>
                {project.description}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>

            {/* Donor Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Donor Information</Text>
              
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                placeholder="Your Name"
                value={donorName}
                editable={false}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                placeholder="Your Email"
                value={donorEmail}
                editable={false}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Donation Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Enter Donation Amount</Text>
              
              <TextInput
                style={styles.amountInput}
                placeholder="LKR 1000"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.quickAmountButtons}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={styles.quickAmountButton}
                    onPress={() => handleQuickAmount(quickAmount)}
                  >
                    <Text style={styles.quickAmountText}>
                      {quickAmount >= 1000 ? `${quickAmount / 1000}K` : quickAmount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Purpose (Optional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Purpose (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a message or purpose for your donation..."
                value={purpose}
                onChangeText={setPurpose}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Impact Preview */}
            <View style={styles.impactCard}>
              <Text style={styles.impactTitle}>Your Impact Preview</Text>
              <Text style={styles.impactValue}>{impact.value}</Text>
              <Text style={styles.impactLabel}>{impact.label}</Text>
              <View style={styles.impactConversion}>
                <Text style={styles.impactConversionText}>{impact.conversion}</Text>
              </View>
            </View>

            {/* Donate Button */}
            <TouchableOpacity
              style={[styles.donateButton, loading && styles.donateButtonDisabled]}
              onPress={handleDonate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="heart" size={20} color="#FFFFFF" style={styles.donateIcon} />
                  <Text style={styles.donateButtonText}>
                    Donate LKR {parseFloat(amount) || 0}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#E53935',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  donorLevelCard: {
    backgroundColor: '#1B5E20',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  donorLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorLevelText: {
    marginLeft: 12,
    flex: 1,
  },
  donorLevelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  donorLevelSubtitle: {
    fontSize: 13,
    color: '#C8E6C9',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  projectDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  quickAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  impactCard: {
    backgroundColor: '#C8E6C9',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2E7D32',
    lineHeight: 56,
  },
  impactLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
  },
  impactConversion: {
    backgroundColor: '#A5D6A7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  impactConversionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B5E20',
  },
  donateButton: {
    backgroundColor: '#E91E63',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donateButtonDisabled: {
    opacity: 0.6,
  },
  donateIcon: {
    marginRight: 8,
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bottomSpacing: {
    height: 20,
  },
});
