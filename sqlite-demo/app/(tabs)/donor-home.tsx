import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Sidebar from '../../components/SideBar';
import { apiService } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function DonorHomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [trendingProjects, setTrendingProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    loadUserData();
    loadTrendingProjects();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await apiService.getTrendingProjects(5);
      if (response.success && response.data) {
        setTrendingProjects(response.data);
      }
    } catch (error: any) {
      console.error('Error loading trending projects:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load trending projects',
        position: 'top',
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food':
      case 'emergency food relief':
        return 'fast-food';
      case 'education':
      case 'education for all':
        return 'school';
      case 'health':
      case 'healthcare':
        return 'medical';
      case 'shelter':
        return 'home';
      case 'water':
        return 'water';
      default:
        return 'heart';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food':
      case 'emergency food relief':
        return { bg: '#FFE5E5', icon: '#FF6347' };
      case 'education':
      case 'education for all':
        return { bg: '#E3F2FD', icon: '#2196F3' };
      case 'health':
      case 'healthcare':
        return { bg: '#E8F5E9', icon: '#4CAF50' };
      case 'shelter':
        return { bg: '#FFF3E0', icon: '#FF9800' };
      case 'water':
        return { bg: '#E1F5FE', icon: '#03A9F4' };
      default:
        return { bg: '#F3E5F5', icon: '#9C27B0' };
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount).replace('LKR', 'Rs.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0288d1" />
      </View>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        userName={userData?.name}
        userEmail={userData?.email}
        userRole={userData?.role}
      />

      {/* Header with Menu Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Ionicons name="menu" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donor Home</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeHeader}>
            <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="#EF4444" />
            </View>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userName}>{userData?.name || 'Priya Perera'}</Text>
              <Text style={styles.userBadge}>Verified Donor</Text>
            </View>
          </View>
          <View style={styles.goldenDonorBadge}>
            <Text style={styles.goldenDonorText}>Golden Donor</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Donated</Text>
            <Text style={styles.statValue}>LKR 120,000</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Impact Score</Text>
            <Text style={styles.statValue}>2000</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Social Rating</Text>
            <Text style={styles.statValue}>9.4</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Next Level Progress</Text>
            <Text style={styles.progressPercentage}>75%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="gift" size={24} color="#0288d1" />
          <Text style={styles.actionButtonText}>Donations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="medal" size={24} color="#FFA500" />
          <Text style={styles.actionButtonText}>Badges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trophy" size={24} color="#FF6347" />
          <Text style={styles.actionButtonText}>Rank</Text>
        </TouchableOpacity>
      </View>

      {/* Make Donation Button */}
      <TouchableOpacity 
        style={styles.makeDonationButton}
        onPress={() => router.push('/(tabs)/donor-projects')}
      >
        <Ionicons name="heart" size={20} color="#FFFFFF" />
        <Text style={styles.makeDonationText}>Make Donation</Text>
      </TouchableOpacity>

      {/* Trending Causes */}
      <View style={styles.trendingSection}>
        <Text style={styles.sectionTitle}>Trending Causes</Text>

        {loadingProjects ? (
          <View style={styles.loadingProjects}>
            <ActivityIndicator size="large" color="#0288d1" />
            <Text style={styles.loadingText}>Loading trending projects...</Text>
          </View>
        ) : trendingProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No trending projects available</Text>
          </View>
        ) : (
          trendingProjects.map((project, index) => {
            const colors = getCategoryColor(project.category);
            const progressPercentage = Math.min(
              ((project.collected_amount || project.current_amount || 0) / project.target_amount) * 100,
              100
            );
            const isCompleted = progressPercentage >= 100;

            return (
              <View key={project.id || index} style={styles.causeCard}>
                <View style={styles.causeHeader}>
                  <View style={[styles.causeIconContainer, { backgroundColor: colors.bg }]}>
                    <Ionicons name={getCategoryIcon(project.category) as any} size={24} color={colors.icon} />
                  </View>
                  <View style={styles.causeInfo}>
                    <Text style={styles.causeTitle}>{project.title || project.name}</Text>
                    <Text style={styles.causeDescription} numberOfLines={2}>
                      {project.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.causeFunding}>
                  <Text style={styles.fundingText}>
                    {formatAmount(project.collected_amount || project.current_amount || 0)} raised
                  </Text>
                  <Text style={styles.fundingGoal}>
                    {formatAmount(project.target_amount)} goal
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${progressPercentage}%`, 
                          backgroundColor: isCompleted ? '#4CAF50' : colors.icon 
                        }
                      ]} 
                    />
                  </View>
                </View>
                <View style={styles.causeFooter}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="trending-up" size={16} color="#FFA500" />
                    <Text style={styles.ratingText}>{progressPercentage.toFixed(0)}%</Text>
                  </View>
                  {project.location && (
                    <View style={styles.locationContainer}>
                      <Ionicons name="location" size={16} color="#666" />
                      <Text style={styles.locationText}>{project.location}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSpacer: {
    width: 44,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  welcomeBanner: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#FFE5E5',
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  userBadge: {
    fontSize: 12,
    color: '#0288d1',
    marginTop: 2,
  },
  goldenDonorBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goldenDonorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0288d1',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  makeDonationButton: {
    flexDirection: 'row',
    backgroundColor: '#FF69B4',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  makeDonationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  trendingSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  causeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  causeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  causeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  causeInfo: {
    flex: 1,
  },
  causeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  causeDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  causeFunding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fundingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  fundingGoal: {
    fontSize: 14,
    color: '#666',
  },
  causeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  loadingProjects: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
