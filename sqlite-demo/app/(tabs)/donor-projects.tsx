import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import Toast from 'react-native-toast-message';
import DonationModal from '../../components/DonationModal';

export default function DonorProjectsScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const categories = ['All', 'Emergency', 'Education', 'Health', 'Environment'];

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await apiService.getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
        setFilteredProjects(response.data);
      }
    } catch (error: any) {
      console.error('Error loading projects:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load projects',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filterProjects = useCallback(() => {
    let filtered = [...projects];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(project =>
        project.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, selectedCategory]);

  useEffect(() => {
    filterProjects();
  }, [filterProjects]);

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('food') || cat.includes('emergency')) return 'fast-food';
    if (cat.includes('education')) return 'school';
    if (cat.includes('health')) return 'medical';
    if (cat.includes('shelter')) return 'home';
    if (cat.includes('water') || cat.includes('environment')) return 'water';
    return 'heart';
  };

  const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('food') || cat.includes('emergency')) 
      return { bg: '#FFE5E5', icon: '#FF6347', badge: '#FF6347' };
    if (cat.includes('education')) 
      return { bg: '#E3F2FD', icon: '#2196F3', badge: '#2196F3' };
    if (cat.includes('health')) 
      return { bg: '#E8F5E9', icon: '#4CAF50', badge: '#4CAF50' };
    if (cat.includes('shelter')) 
      return { bg: '#FFF3E0', icon: '#FF9800', badge: '#FF9800' };
    if (cat.includes('water') || cat.includes('environment')) 
      return { bg: '#E1F5FE', icon: '#03A9F4', badge: '#03A9F4' };
    return { bg: '#F3E5F5', icon: '#9C27B0', badge: '#9C27B0' };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount).replace('LKR', 'Rs.');
  };

  const calculateDaysLeft = (endDate: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const isUrgent = (project: any) => {
    const daysLeft = calculateDaysLeft(project.end_date);
    const progressPercentage = ((project.collected_amount || project.current_amount || 0) / project.target_amount) * 100;
    return daysLeft !== null && daysLeft <= 15 && progressPercentage < 100;
  };

  const handleDonate = (project: any) => {
    setSelectedProject(project);
    setShowDonationModal(true);
  };

  const handleDonationSuccess = () => {
    // Reload projects to get updated amounts
    loadProjects();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0288d1" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>
          {filteredProjects.length} Project{filteredProjects.length !== 1 ? 's' : ''} Found
        </Text>
      </View>

      {/* Projects List */}
      <View style={styles.projectsContent}>
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No projects found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredProjects.map((project) => {
            const colors = getCategoryColor(project.category);
            const progressPercentage = Math.min(
              ((project.collected_amount || project.current_amount || 0) / project.target_amount) * 100,
              100
            );
            const daysLeft = calculateDaysLeft(project.end_date);
            const urgent = isUrgent(project);
            const supporters = Math.floor(Math.random() * 500) + 50; // Mock data

            return (
              <View key={project.id} style={[styles.projectCard, urgent && styles.projectCardUrgent]}>
                {/* Urgent Badge */}
                {urgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>Urgent</Text>
                  </View>
                )}

                {/* Category Badge */}
                <View style={styles.categoryBadgeContainer}>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.badge }]}>
                    <Text style={styles.categoryBadgeText}>
                      {project.category || 'General'}
                    </Text>
                  </View>
                </View>

                {/* Icon */}
                <View style={[styles.projectIcon, { backgroundColor: colors.bg }]}>
                  <Ionicons name={getCategoryIcon(project.category) as any} size={40} color={colors.icon} />
                </View>

                {/* Title and Description */}
                <Text style={styles.projectTitle}>{project.title || project.name}</Text>
                <Text style={styles.projectDescription} numberOfLines={2}>
                  {project.description}
                </Text>

                {/* Funding Info */}
                <View style={styles.fundingContainer}>
                  <Text style={styles.fundingRaised}>
                    {formatAmount(project.collected_amount || project.current_amount || 0)} raised
                  </Text>
                  <Text style={styles.fundingGoal}>
                    {formatAmount(project.target_amount)} goal
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${progressPercentage}%`,
                        backgroundColor: progressPercentage >= 100 ? '#4CAF50' : colors.icon
                      }
                    ]} 
                  />
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Ionicons name="people" size={16} color="#9CA3AF" />
                    <Text style={styles.statText}>{supporters} supporters</Text>
                  </View>
                  {daysLeft !== null && (
                    <View style={styles.stat}>
                      <Ionicons name="time" size={16} color="#9CA3AF" />
                      <Text style={styles.statText}>{daysLeft} days left</Text>
                    </View>
                  )}
                </View>

                {/* Donate Button */}
                <TouchableOpacity 
                  style={styles.donateButton}
                  onPress={() => handleDonate(project)}
                >
                  <Text style={styles.donateButtonText}>Donate Now</Text>
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity style={styles.shareButton}>
                  <Ionicons name="share-social" size={20} color="#6B7280" />
                </TouchableOpacity>

                {/* Organization */}
                <Text style={styles.organizationText}>
                  by {project.creator_name || 'ImpactTrace Foundation'}
                </Text>
              </View>
            );
          })
        )}
      </View>
      </ScrollView>

      {/* Donation Modal */}
      {selectedProject && (
        <DonationModal
          visible={showDonationModal}
          onClose={() => setShowDonationModal(false)}
          project={selectedProject}
          onDonationSuccess={handleDonationSuccess}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#111827',
  },
  categoriesContainer: {
    marginBottom: 12,
    maxHeight: 40,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#0288d1',
    borderColor: '#0288d1',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  projectsContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  projectCardUrgent: {
    borderWidth: 2,
    borderColor: '#FF6347',
  },
  urgentBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FF6347',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryBadgeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'left',
    lineHeight: 24,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 14,
  },
  fundingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fundingRaised: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  fundingGoal: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  donateButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  shareButton: {
    position: 'absolute',
    bottom: 58,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizationText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
  },
});
