import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { Application } from '../../services/types';
import { getCurrentUser } from '../../Utils/auth';

export default function ApplicationHistoryScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications when component mounts
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setError(null);
      const user = await getCurrentUser();
      
      if (!user || !user.id) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      // Fetch applications by beneficiary ID
      const response = await apiService.getApplicationsByBeneficiary(user.id);
      
      if (response.success && response.data) {
        // Sort applications by created_at date (newest first)
        const sortedApplications = response.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setApplications(sortedApplications);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      case 'under_review':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time';
      case 'under_review':
        return 'hourglass';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApplicationPress = (application: Application) => {
    // You can navigate to a detailed view or show a modal
    Alert.alert(
      'Application Details',
      `Type: ${application.application_type}\n` +
      `Title: ${application.title || 'N/A'}\n` +
      `Status: ${application.status.toUpperCase()}\n` +
      `Created: ${formatDate(application.created_at)}\n` +
      (application.target_amount ? `Amount: $${application.target_amount}\n` : '') +
      (application.review_notes ? `Notes: ${application.review_notes}` : ''),
      [{ text: 'OK' }]
    );
  };

  const renderApplicationCard = (application: Application) => {
    return (
      <TouchableOpacity
        key={application.id}
        style={styles.card}
        onPress={() => handleApplicationPress(application)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="document-text" size={24} color="#0288d1" />
            <Text style={styles.cardTitle} numberOfLines={1}>
              {application.application_type}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
            <Ionicons 
              name={getStatusIcon(application.status) as any} 
              size={16} 
              color="#fff" 
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>
              {application.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {application.title && (
          <View style={styles.cardRow}>
            <Ionicons name="briefcase-outline" size={16} color="#666" />
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {application.title}
            </Text>
          </View>
        )}

        <Text style={styles.cardDescription} numberOfLines={2}>
          {application.description}
        </Text>

        {application.target_amount && (
          <View style={styles.cardRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.amountText}>
              Amount Requested: ${application.target_amount.toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#999" />
            <Text style={styles.dateText}>
              {formatDate(application.created_at)}
            </Text>
          </View>
          {application.reviewed_at && (
            <View style={styles.dateContainer}>
              <Ionicons name="checkmark-done-outline" size={14} color="#999" />
              <Text style={styles.dateText}>
                Reviewed: {formatDate(application.reviewed_at)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0288d1" />
          <Text style={styles.loadingText}>Loading your applications...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={60} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchApplications}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Application History</Text>
        <Text style={styles.headerSubtitle}>
          {applications.length} {applications.length === 1 ? 'application' : 'applications'} found
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0288d1']}
            tintColor="#0288d1"
          />
        }
      >
        {applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyText}>
              You haven&apos;t submitted any applications yet.{'\n'}
              Start by exploring available projects!
            </Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {applications.map(renderApplicationCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fdff',
  },
  header: {
    backgroundColor: '#4fc3f7',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#0288d1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  amountText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});
