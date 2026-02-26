// app/(tabs)/home.tsx
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { DonationStats, ImpactSummary } from '../../services/types';
import LoadingSpinner from '../../components/loadingSpinner';
import ErrorMessage from '../../components/errorMessage';
import Sidebar from '../../components/SideBar';
import { getCurrentUser, UserData } from '../../Utils/auth';

// Category performance data type
interface CategoryPerformance {
  name: string;
  percentage: number;
  trend: number;
  color: string;
}

// Impact efficiency data type
interface ImpactEfficiency {
  title: string;
  achieved: number;
  target: number;
  efficiency: number;
  color: string;
}

export default function HomeScreen() {
  const [donationStats, setDonationStats] = useState<DonationStats | null>(null);
  const [impactSummary, setImpactSummary] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Sample category performance data (in production, fetch from API)
  const [categoryPerformance] = useState<CategoryPerformance[]>([
    { name: 'Food', percentage: 40, trend: 15, color: '#a855f7' },
    { name: 'Medicine', percentage: 30, trend: 8, color: '#4caf50' },
    { name: 'Education', percentage: 20, trend: -5, color: '#ffa726' },
    { name: 'Emergency', percentage: 10, trend: 25, color: '#ff7043' },
  ]);

  // Sample impact efficiency data (in production, fetch from API)
  const [impactEfficiency] = useState<ImpactEfficiency[]>([
    { title: 'Families Fed', achieved: 312, target: 400, efficiency: 95, color: '#4caf50' },
    { title: 'Children Educated', achieved: 156, target: 200, efficiency: 88, color: '#ffa726' },
    { title: 'Medical Treatments', achieved: 88, target: 120, efficiency: 92, color: '#4caf50' },
    { title: 'Emergency Relief', achieved: 45, target: 50, efficiency: 98, color: '#4caf50' },
  ]);

  useEffect(() => {
    loadDashboardData();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setUserData(user);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Check what's in the database
      const debugResponse = await apiService.getDebugInfo();
      console.log('=== DATABASE DEBUG INFO ===');
      console.log('Debug Info:', debugResponse.data);
      
      const [statsResponse, impactResponse] = await Promise.all([
        apiService.getDonationStats(),
        apiService.getImpactSummary()
      ]);

      console.log('Donation Stats:', statsResponse.data);
      console.log('Impact Summary:', impactResponse.data);

      setDonationStats(statsResponse.data);
      setImpactSummary(impactResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadDashboardData}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        userName={userData?.name || 'Guest User'}
        userEmail={userData?.email || 'guest@impacttrace.com'}
        userRole={userData?.role || 'Guest'}
      />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <View style={styles.hamburger}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Donation Tracker</Text>
          <Text style={styles.headerSubtitle}>
            Track donations and manage projects
          </Text>
        </View>
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/Donation-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.welcomeTitle}>Welcome to Donation Tracker</Text>
          <Text style={styles.welcomeSubtitle}>
            Track donations, manage projects, and help communities in real-time.
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Impact Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>${donationStats?.totalAmount.toLocaleString() || '0'}</Text>
              <Text style={styles.statLabel}>Total Donations</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{impactSummary?.beneficiaries_helped || '0'}</Text>
              <Text style={styles.statLabel}>Beneficiaries Helped</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{impactSummary?.active_projects || '0'}</Text>
              <Text style={styles.statLabel}>Active Projects</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{donationStats?.totalDonations || '0'}</Text>
              <Text style={styles.statLabel}>Total Donors</Text>
            </View>
          </View>
        </View>

        {/* Category Performance & Trends */}
        <View style={styles.performanceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category Performance & Trends</Text>
          </View>
          
          {categoryPerformance.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryTitleRow}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.trendBadge}>
                  <Text style={styles.trendText}>
                    {category.trend > 0 ? '+' : ''}{category.trend}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${category.percentage}%`,
                        backgroundColor: category.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.percentageText}>{category.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Impact Efficiency Dashboard */}
        <View style={styles.efficiencySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Impact Efficiency Dashboard</Text>
          </View>
          
          <View style={styles.efficiencyGrid}>
            {impactEfficiency.map((impact, index) => (
              <View key={index} style={styles.efficiencyCard}>
                <Text style={styles.efficiencyTitle}>{impact.title}</Text>
                <Text style={styles.efficiencyStats}>
                  {impact.achieved}/{impact.target}
                </Text>
                <Text style={styles.efficiencyPercentage}>
                  {impact.efficiency}% efficient
                </Text>
                <View style={styles.efficiencyBarBackground}>
                  <View 
                    style={[
                      styles.efficiencyBarFill,
                      { 
                        width: `${(impact.achieved / impact.target) * 100}%`,
                        backgroundColor: impact.color 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Together, making a difference in communities worldwide.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4fc3f7',
  },
  header: {
    backgroundColor: '#4fc3f7',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 15,
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.95,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  hamburger: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: '100%',
    height: 3,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8fdff' 
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: { 
    padding: 20, 
    paddingTop: 25,
    backgroundColor: '#e3f2fd', 
    alignItems: 'center',
    position: 'relative'
  },
  logoContainer: {
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  welcomeTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 10,
  },
  welcomeSubtitle: { 
    fontSize: 15, 
    color: '#666', 
    textAlign: 'center',
  },
  statsSection: { 
    padding: 20 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333',
    flex: 1,
    paddingBottom: 8,
  },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  statCard: { 
    width: '48%', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center'
  },
  statNumber: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#4fc3f7',
    marginBottom: 5
  },
  statLabel: { 
    fontSize: 12, 
    color: '#666', 
    textAlign: 'center'
  },
  // Category Performance Styles
  performanceSection: {
    padding: 20,
    paddingTop: 10,
  },
  categoryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trendBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
    minWidth: 40,
  },
  // Impact Efficiency Styles
  efficiencySection: {
    padding: 20,
    paddingTop: 10,
  },
  efficiencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  efficiencyCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  efficiencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  efficiencyStats: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  efficiencyPercentage: {
    fontSize: 12,
    color: '#4caf50',
    marginBottom: 10,
  },
  efficiencyBarBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  efficiencyBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: { 
    padding: 20, 
    alignItems: 'center',
    marginTop: 10
  },
  footerText: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center',
    fontStyle: 'italic'
  },
});