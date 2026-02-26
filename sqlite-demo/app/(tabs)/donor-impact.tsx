// app/(tabs)/donor-impact.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { DonorImpactData, DonorImpactHistory } from '../../services/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TabType = 'overview' | 'history' | 'updates';

export default function DonorImpactScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [impactData, setImpactData] = useState<DonorImpactData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donorId, setDonorId] = useState<number | null>(null);

  const fetchImpactData = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDonorImpact(id);
      
      if (response.success) {
        setImpactData(response.data);
      } else {
        setError(response.message || 'Failed to load impact data');
      }
    } catch (err: any) {
      console.error('Error fetching impact data:', err);
      setError(err.message || 'Failed to load impact data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadDonorInfo = useCallback(async () => {
    try {
      const userStr = await AsyncStorage.getItem('userData');
      if (userStr) {
        const user = JSON.parse(userStr);
        setDonorId(user.id);
        await fetchImpactData(user.id);
      } else {
        setError('Please log in to view your impact');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading donor info:', err);
      setError('Failed to load user information');
      setLoading(false);
    }
  }, [fetchImpactData]);

  useEffect(() => {
    loadDonorInfo();
  }, [loadDonorInfo]);

  const onRefresh = async () => {
    if (donorId) {
      setRefreshing(true);
      await fetchImpactData(donorId);
    }
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getImpactMessage = (item: DonorImpactHistory) => {
    if (item.impact_description) {
      return item.impact_description;
    }
    return `Contributed ${formatCurrency(item.amount_used || item.amount)} to ${item.project_title}`;
  };

  const renderOverview = () => {
    if (!impactData) return null;

    const stats = impactData.stats;
    // Calculate reward points (example: 1 point per 100 LKR)
    const rewardPoints = Math.floor(stats.total_donated / 100);

    return (
      <View style={styles.overviewContainer}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFE5E5' }]}>
            <Text style={[styles.statValue, { color: '#E53935' }]}>
              {(stats.total_donated / 1000000).toFixed(1)}M
            </Text>
            <Text style={styles.statLabel}>Total Donated</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.statValue, { color: '#1976D2' }]}>
              {stats.projects_supported}
            </Text>
            <Text style={styles.statLabel}>Projects Supported</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Text style={[styles.statValue, { color: '#7B1FA2' }]}>
              {stats.avg_donation.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.statValue, { color: '#388E3C' }]}>
              {rewardPoints}
            </Text>
            <Text style={styles.statLabel}>Reward Points</Text>
          </View>
        </View>

        {/* Your Impact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          
          <View style={styles.impactCard}>
            <View style={styles.impactItem}>
              <Ionicons name="heart-circle" size={24} color="#4CAF50" />
              <View style={styles.impactText}>
                <Text style={styles.impactTitle}>
                  {stats.beneficiaries_impacted} families received emergency food
                </Text>
                <Text style={styles.impactSubtitle}>Thanks to your donations</Text>
              </View>
            </View>
          </View>

          <View style={styles.impactCard}>
            <View style={styles.impactItem}>
              <Ionicons name="school" size={24} color="#2196F3" />
              <View style={styles.impactText}>
                <Text style={styles.impactTitle}>
                  {stats.impact_records_count} children got school supplies
                </Text>
                <Text style={styles.impactSubtitle}>Education support impact</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderHistory = () => {
    if (!impactData || !impactData.history || impactData.history.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>No donation history yet</Text>
          <Text style={styles.emptySubtext}>
            Start making donations to see your impact history
          </Text>
        </View>
      );
    }

    // Group history by project
    const groupedHistory: { [key: string]: DonorImpactHistory[] } = {};
    impactData.history.forEach((item) => {
      const key = item.project_title || 'Unknown Project';
      if (!groupedHistory[key]) {
        groupedHistory[key] = [];
      }
      groupedHistory[key].push(item);
    });

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Donation History</Text>
        {Object.entries(groupedHistory).map(([projectTitle, donations]) => {
          const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
          const impactDescription = donations.find(d => d.impact_description)?.impact_description;
          
          return (
            <View key={projectTitle} style={styles.historyCard}>
              <Text style={styles.historyProjectTitle}>{projectTitle}</Text>
              <Text style={styles.historyAmount}>
                {getImpactMessage(donations[0])}
              </Text>
              {impactDescription && (
                <Text style={styles.historyImpact}>{impactDescription}</Text>
              )}
              <View style={styles.historyFooter}>
                <Text style={styles.historyCategory}>
                  {donations[0].project_category || 'General'}
                </Text>
                <Text style={styles.historyAmount}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderUpdates = () => {
    if (!impactData || !impactData.history || impactData.history.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>No updates yet</Text>
          <Text style={styles.emptySubtext}>
            You&apos;ll receive updates when projects make progress
          </Text>
        </View>
      );
    }

    // Filter items with status updates
    const updates = impactData.history.filter(item => item.status_update);

    if (updates.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>No updates yet</Text>
        </View>
      );
    }

    return (
      <View style={styles.updatesContainer}>
        <Text style={styles.sectionTitle}>Project Updates</Text>
        {updates.map((item, index) => (
          <View key={`${item.donation_id}-${index}`} style={styles.updateCard}>
            <View style={styles.updateHeader}>
              <Text style={styles.updateProject}>{item.project_title}</Text>
              <Text style={styles.updateDate}>
                {item.impact_date ? formatDate(item.impact_date) : formatDate(item.donation_date)}
              </Text>
            </View>
            <Text style={styles.updateText}>{item.status_update}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4fc3f7" />
        <Text style={styles.loadingText}>Loading your impact...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDonorInfo}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Impact Dashboard</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            My Impact
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'updates' && styles.activeTab]}
          onPress={() => setActiveTab('updates')}
        >
          <Text style={[styles.tabText, activeTab === 'updates' && styles.activeTabText]}>
            Updates
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'updates' && renderUpdates()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4fc3f7',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4fc3f7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overviewContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  impactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactText: {
    marginLeft: 12,
    flex: 1,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  impactSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  historyContainer: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  historyProjectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  historyImpact: {
    fontSize: 13,
    color: '#4CAF50',
    marginBottom: 8,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  historyCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  updatesContainer: {
    padding: 16,
  },
  updateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateProject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  updateDate: {
    fontSize: 12,
    color: '#999',
  },
  updateText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
