// app/(tabs)/admin.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { apiService } from '../../services/api';
import { Project } from '../../services/types';
import LoadingSpinner from "../../components/loadingSpinner";
import ErrorMessage from "../../components/errorMessage";
import CreateProjectModal from "../../components/CreateProjectModal";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import { Ionicons } from "@expo/vector-icons";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const projectsResponse = await apiService.getProjects();
      setProjects(projectsResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active': return styles.activeStatus;
      case 'completed': return styles.completedStatus;
      default: return styles.pendingStatus;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading projects..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadProjects}
      />
    );
  }

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Project Management</Text>
          <Text style={styles.headerSubtitle}>Manage and track ongoing projects</Text>
        </View>
        <TouchableOpacity 
          style={styles.newProjectButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Active Projects Section */}
        {activeProjects.length > 0 && (
          <>
            {activeProjects.map((project) => {
              const progress = Math.min((project.collected_amount / project.target_amount) * 100, 100);
              
              return (
                <View key={project.id} style={styles.projectCard}>
                  {/* Project Header */}
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{project.name}</Text>
                    <View style={[styles.statusBadge, getStatusBadgeStyle(project.status)]}>
                      <Text style={styles.statusText}>{project.status}</Text>
                    </View>
                  </View>

                  {/* Progress Section */}
                  <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressAmount}>
                      ${project.collected_amount.toLocaleString()}/${project.target_amount.toLocaleString()}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${progress}%` }
                        ]} 
                      />
                    </View>
                  </View>

                  {/* View Button */}
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewProject(project)}
                  >
                    <Ionicons name="eye-outline" size={18} color="#666" />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        {/* Completed Projects Section */}
        {completedProjects.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.sectionTitle}>Completed Projects</Text>
            {completedProjects.map((project) => {
              const progress = Math.min((project.collected_amount / project.target_amount) * 100, 100);
              
              return (
                <View key={project.id} style={styles.projectCard}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{project.name}</Text>
                    <View style={[styles.statusBadge, getStatusBadgeStyle(project.status)]}>
                      <Text style={styles.statusText}>{project.status}</Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressAmount}>
                      ${project.collected_amount.toLocaleString()}/${project.target_amount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${progress}%` }
                        ]} 
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewProject(project)}
                  >
                    <Ionicons name="eye-outline" size={18} color="#666" />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {projects.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No projects available</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>Create Your First Project</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Project Modal */}
      <CreateProjectModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={loadProjects}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        visible={showDetailsModal}
        project={selectedProject}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProject(null);
        }}
        onProjectUpdated={() => {
          loadProjects();
          setShowDetailsModal(false);
          setSelectedProject(null);
        }}
        onProjectDeleted={() => {
          loadProjects();
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.95
  },
  newProjectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  newProjectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  content: {
    flex: 1,
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    marginTop: 20
  },
  projectCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10
  },
  activeStatus: {
    backgroundColor: '#4caf50'
  },
  completedStatus: {
    backgroundColor: '#2196f3'
  },
  pendingStatus: {
    backgroundColor: '#ff9800'
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'lowercase'
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  progressAmount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600'
  },
  progressBarContainer: {
    marginBottom: 15
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#333',
    borderRadius: 5
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    gap: 5
  },
  viewButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  },
  completedSection: {
    marginTop: 10
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20
  },
  emptyStateButton: {
    backgroundColor: '#4fc3f7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
});