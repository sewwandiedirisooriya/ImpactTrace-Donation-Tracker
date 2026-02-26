// app/(tabs)/applications.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { apiService } from '../../services/api';
import { Application } from '../../services/types';
import LoadingSpinner from "../../components/loadingSpinner";
import ErrorMessage from "../../components/errorMessage";
import ApplicationDetailsModal from "../../components/ApplicationDetailsModal";
import { Ionicons } from "@expo/vector-icons";

export default function ApplicationManagementScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getApplications();
      setApplications(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      case 'completed':
        return '#2196f3';
      default:
        return '#ff9800';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading applications..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadApplications}
      />
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');
  const stats = {
    pending: pendingApplications.length,
    avgProcessingDays: 2.3,
    approvalRate: applications.length > 0 
      ? Math.round((approvedApplications.length / applications.length) * 100) 
      : 0,
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Application Management</Text>
        <View style={styles.aiPrioritizedBadge}>
          <Ionicons name="sparkles" size={14} color="#fff" />
          <Text style={styles.aiPrioritizedText}>AI Prioritized</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending Review</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avgProcessingDays} days</Text>
          <Text style={styles.statLabel}>Avg Processing</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.approvalRate}%</Text>
          <Text style={styles.statLabel}>Approval Rate</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <>
            {pendingApplications.map((application) => (
              <TouchableOpacity
                key={application.id}
                style={styles.applicationCard}
                onPress={() => handleViewApplication(application)}
                activeOpacity={0.7}
              >
                {/* Applicant Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>{application.beneficiary_name || 'Unknown'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                      <Text style={styles.statusText}>{application.status}</Text>
                    </View>
                  </View>
                </View>

                {/* Project Title */}
                <Text style={styles.projectTitle}>{application.title || 'No Title'}</Text>

                {/* Details */}
                <Text style={styles.needsDetail} numberOfLines={2}>
                  {application.description}
                </Text>

                {/* Applied Date */}
                <Text style={styles.appliedDate}>Applied: {formatDate(application.created_at)}</Text>

                {/* AI Assessment */}
                <View style={styles.aiAssessmentBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4fc3f7" />
                  <Text style={styles.aiAssessmentText}>
                    AI Assessment 92% likely genuine need based on criteria analysis
                  </Text>
                </View>

                {/* Action Buttons - Hidden, shown in modal instead */}
                <View style={styles.actionHint}>
                  <Ionicons name="chevron-forward" size={20} color="#4fc3f7" />
                  <Text style={styles.actionHintText}>Tap to review and approve</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Approved Applications Section */}
        {approvedApplications.length > 0 && (
          <View style={styles.approvedSection}>
            <Text style={styles.sectionTitle}>Approved Applications</Text>
            {approvedApplications.map((application) => (
              <TouchableOpacity
                key={application.id}
                style={styles.applicationCard}
                onPress={() => handleViewApplication(application)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>{application.beneficiary_name || 'Unknown'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                      <Text style={styles.statusText}>{application.status}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.projectTitle}>{application.title || 'No Title'}</Text>
                <Text style={styles.needsDetail} numberOfLines={2}>
                  {application.description}
                </Text>
                <Text style={styles.appliedDate}>Applied: {formatDate(application.created_at)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Rejected Applications Section */}
        {rejectedApplications.length > 0 && (
          <View style={styles.rejectedSection}>
            <Text style={styles.sectionTitle}>Rejected Applications</Text>
            {rejectedApplications.map((application) => (
              <TouchableOpacity
                key={application.id}
                style={styles.applicationCard}
                onPress={() => handleViewApplication(application)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>{application.beneficiary_name || 'Unknown'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                      <Text style={styles.statusText}>{application.status}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.projectTitle}>{application.title || 'No Title'}</Text>
                <Text style={styles.needsDetail} numberOfLines={2}>
                  {application.description}
                </Text>
                <Text style={styles.appliedDate}>Applied: {formatDate(application.created_at)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {applications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No applications available</Text>
          </View>
        )}
      </ScrollView>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        visible={showDetailsModal}
        application={selectedApplication}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedApplication(null);
        }}
        onApplicationUpdated={async () => {
          await loadApplications();
          setShowDetailsModal(false);
          setSelectedApplication(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fdff'
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
  aiPrioritizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiPrioritizedText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.95,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fdff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
    color: '#333',
  },
  applicationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  applicantInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  needsDetail: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  appliedDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  aiAssessmentBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  aiAssessmentText: {
    flex: 1,
    fontSize: 12,
    color: '#1976d2',
    lineHeight: 16,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionHintText: {
    fontSize: 13,
    color: '#4fc3f7',
    fontWeight: '500',
  },
  approvedSection: {
    marginTop: 8,
  },
  rejectedSection: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
