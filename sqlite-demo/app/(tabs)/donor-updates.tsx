import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/services/api';
import { ImpactRecord } from '@/services/types';

interface UpdateCardProps {
  projectName: string;
  description: string;
  statusUpdate: string;
  timestamp: string;
  category: string;
  amountUsed?: number;
}

const UpdateCard = ({ 
  projectName, 
  description, 
  statusUpdate, 
  timestamp,
  category,
  amountUsed
}: UpdateCardProps) => {
  const getCategoryColor = (cat: string) => {
    const colors: { [key: string]: string } = {
      'Emergency': '#FF6B6B',
      'Education': '#4ECDC4',
      'Health': '#45B7D1',
      'Infrastructure': '#96CEB4',
      'Community': '#FFEAA7',
    };
    return colors[cat] || '#95A5A6';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <View style={styles.updateCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="#fff" />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.projectName}>{projectName}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.timestamp}>{getTimeAgo(timestamp)}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(category) }]}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.updateDescription}>{description}</Text>
        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
          <Text style={styles.statusUpdate}>{statusUpdate}</Text>
        </View>
        {amountUsed && amountUsed > 0 && (
          <View style={styles.amountContainer}>
            <Ionicons name="cash-outline" size={16} color="#0288d1" />
            <Text style={styles.amountText}>
              Funds utilized: ${amountUsed.toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function DonorUpdatesScreen() {
  const [updates, setUpdates] = useState<ImpactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = async () => {
    try {
      setError(null);
      const response = await apiService.getImpactRecords();
      if (response.success && response.data) {
        setUpdates(response.data);
      } else {
        setError('Failed to load updates');
      }
    } catch (err: any) {
      console.error('Error fetching updates:', err);
      setError(err.message || 'Failed to load updates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUpdates();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0288d1" />
          <Text style={styles.loadingText}>Loading updates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Project Updates</Text>
          <Text style={styles.subtitle}>
            Stay informed about the impact of your contributions
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#E74C3C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {updates.length === 0 && !error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Updates Yet</Text>
            <Text style={styles.emptyText}>
              Project updates will appear here once activities are recorded
            </Text>
          </View>
        ) : (
          <View style={styles.updatesContainer}>
            {updates.map((update) => (
              <UpdateCard
                key={update.id}
                projectName={update.project_name || 'Project Update'}
                description={update.impact_description}
                statusUpdate={update.status_update}
                timestamp={update.created_at}
                category={getCategoryFromDescription(update.impact_description)}
                amountUsed={update.amount_used}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to extract category from description
const getCategoryFromDescription = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('emergency') || lowerDesc.includes('relief')) return 'Emergency';
  if (lowerDesc.includes('education') || lowerDesc.includes('school')) return 'Education';
  if (lowerDesc.includes('health') || lowerDesc.includes('medical') || lowerDesc.includes('water')) return 'Health';
  if (lowerDesc.includes('infrastructure') || lowerDesc.includes('building')) return 'Infrastructure';
  return 'Community';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
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
  errorContainer: {
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#C0392B',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  updatesContainer: {
    gap: 16,
  },
  updateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0288d1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timestamp: {
    fontSize: 13,
    color: '#95A5A6',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  cardContent: {
    gap: 12,
  },
  updateDescription: {
    fontSize: 15,
    color: '#34495E',
    lineHeight: 22,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  statusUpdate: {
    flex: 1,
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  amountText: {
    fontSize: 14,
    color: '#0288d1',
    fontWeight: '600',
  },
});
