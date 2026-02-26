// app/(tabs)/beneficiary-home.tsx
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/loadingSpinner';
import ErrorMessage from '../../components/errorMessage';
import Sidebar from '../../components/SideBar';
import { getCurrentUser, UserData } from '../../Utils/auth';
import { router } from 'expo-router';
import { apiService } from '../../services/api';

// Quick action type
interface QuickAction {
  id: string;
  title: string;
  icon: any;
  color: string;
  route: string;
}

interface ActivityItem {
  id: number;
  type: string;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  timestamp: string;
}

export default function BeneficiaryHomeScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [totalDonationsReceived, setTotalDonationsReceived] = useState(0);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [applicationStats, setApplicationStats] = useState({
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // Quick actions for beneficiaries
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Request Donation',
      icon: 'add-circle',
      color: '#4caf50',
      route: '/beneficiary',
    },
    {
      id: '2',
      title: 'Track Requests',
      icon: 'location',
      color: '#2196f3',
      route: '/beneficiary',
    },
    {
      id: '3',
      title: 'Application History',
      icon: 'time',
      color: '#ff9800',
      route: '/application-history',
    },
    {
      id: '4',
      title: 'My Profile',
      icon: 'person',
      color: '#9c27b0',
      route: '/home',
    },
  ];

  const loadBeneficiaryData = async () => {
    try {
      if (!userData?.email) {
        console.log('No user email available');
        return;
      }

      // Fetch dashboard data from backend
      const response = await apiService.getBeneficiaryDashboard(userData.email);
      
      if (response.success && response.data) {
        setTotalDonationsReceived(response.data.totalDonationsReceived || 0);
        setRecentActivities(response.data.recentActivities || []);
        setApplicationStats(response.data.applicationStats || {
          pending: 0,
          under_review: 0,
          approved: 0,
          rejected: 0,
          total: 0
        });
      }
    } catch (err: any) {
      console.error('Error loading beneficiary data:', err);
      // Don't set error here, just log it
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await getCurrentUser();
      setUserData(user);

      // In production, fetch actual data from API
      // For now, using sample data
      await loadBeneficiaryData();
      
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickAction = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route as any);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
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
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setSidebarVisible(true)}
          >
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Welcome Back!</Text>
            <Text style={styles.headerSubtitle}>{userData?.name || 'Beneficiary'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#fff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Total Donations Card */}
          <View style={styles.totalCard}>
            <View style={styles.totalCardHeader}>
              <Ionicons name="wallet" size={32} color="#4caf50" />
              <View style={styles.totalCardContent}>
                <Text style={styles.totalCardLabel}>Total Donations Received</Text>
                <Text style={styles.totalCardAmount}>
                  LKR {totalDonationsReceived.toLocaleString()}
                </Text>
              </View>
            </View>
            <Text style={styles.totalCardSubtext}>
              Your total support across all approved applications
            </Text>
          </View>

          {/* Application Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Application Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#4caf5020' }]}>
                  <Ionicons name="checkmark-circle" size={28} color="#4caf50" />
                </View>
                <Text style={styles.statValue}>{applicationStats.approved}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#2196f320' }]}>
                  <Ionicons name="eye" size={28} color="#2196f3" />
                </View>
                <Text style={styles.statValue}>{applicationStats.under_review}</Text>
                <Text style={styles.statLabel}>Under Review</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#ff980020' }]}>
                  <Ionicons name="time" size={28} color="#ff9800" />
                </View>
                <Text style={styles.statValue}>{applicationStats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#f4433620' }]}>
                  <Ionicons name="close-circle" size={28} color="#f44336" />
                </View>
                <Text style={styles.statValue}>{applicationStats.rejected}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionButton, { borderLeftColor: action.color }]}
                  onPress={() => handleQuickAction(action)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                    <Ionicons name={action.icon} size={28} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/beneficiary')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.activityList}>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                      <Ionicons name={activity.icon as any} size={24} color={activity.color} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                      <Text style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyStateText}>No recent activities</Text>
                  <Text style={styles.emptyStateSubtext}>Your application updates will appear here</Text>
                </View>
              )}
            </View>
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={24} color="#ffc107" />
              <Text style={styles.tipsTitle}>Helpful Tips</Text>
            </View>
            <Text style={styles.tipsText}>
              • Provide detailed information in your applications for faster approval{'\n'}
              • Keep your contact information up to date{'\n'}
              • Check notifications regularly for updates on your requests
            </Text>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>

      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)}
        userName={userData?.name || 'Guest User'}
        userEmail={userData?.email || 'guest@impacttrace.com'}
        userRole={userData?.role || 'Guest'}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4fc3f7',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 40,
  },
  menuButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  headerSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  totalCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalCardContent: {
    marginLeft: 16,
    flex: 1,
  },
  totalCardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalCardAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  totalCardSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  statsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionsGrid: {
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '600',
  },
  activityList: {
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  tipsCard: {
    backgroundColor: '#fffbea',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
