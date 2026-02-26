// components/ProjectDetailsModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Project } from '../services/types';
import { apiService } from '../services/api';

interface ProjectDetailsModalProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
  onProjectUpdated: () => void;
  onProjectDeleted: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  visible,
  project,
  onClose,
  onProjectUpdated,
  onProjectDeleted
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    target_amount: '',
    timeline: '',
    location: '',
    target_beneficiaries: '',
    description: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    'Education',
    'Healthcare',
    'Food & Nutrition',
    'Clean Water',
    'Shelter',
    'Livelihood',
    'Disaster Relief',
    'Other'
  ];

  const timelines = [
    '1 Month',
    '3 Months',
    '6 Months',
    '1 Year',
    'Ongoing'
  ];

  useEffect(() => {
    if (project) {
      // Parse the description to extract structured data
      const descriptionParts = project.description.split('\n\n');
      const metaData = descriptionParts[0] || '';
      const actualDescription = descriptionParts.slice(1).join('\n\n').replace('Description:\n', '').trim();

      // Extract category
      const categoryMatch = metaData.match(/Category: (.+)/);
      const category = categoryMatch ? categoryMatch[1].trim() : '';

      // Extract timeline
      const timelineMatch = metaData.match(/Timeline: (.+)/);
      const timeline = timelineMatch ? timelineMatch[1].trim() : '';

      // Extract location
      const locationMatch = metaData.match(/Location: (.+)/);
      const location = locationMatch ? locationMatch[1].trim() : '';

      // Extract target beneficiaries
      const beneficiariesMatch = metaData.match(/Target Beneficiaries: (.+)/);
      const beneficiaries = beneficiariesMatch ? beneficiariesMatch[1].trim() : '';

      setFormData({
        name: project.name,
        category,
        target_amount: project.target_amount.toString(),
        timeline,
        location,
        target_beneficiaries: beneficiaries,
        description: actualDescription
      });
    }
  }, [project]);

  const calculateProgress = () => {
    if (!project) return 0;
    return Math.min((project.collected_amount / project.target_amount) * 100, 100);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.target_amount) {
      newErrors.target_amount = 'Target amount is required';
    } else if (isNaN(Number(formData.target_amount)) || Number(formData.target_amount) <= 0) {
      newErrors.target_amount = 'Please enter a valid amount';
    }

    if (!formData.timeline) {
      newErrors.timeline = 'Timeline is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm() || !project) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields correctly',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Create the full description
      const fullDescription = `
Category: ${formData.category}
Timeline: ${formData.timeline}
${formData.location ? `Location: ${formData.location}` : ''}
${formData.target_beneficiaries ? `Target Beneficiaries: ${formData.target_beneficiaries}` : ''}

Description:
${formData.description}
      `.trim();

      const updateData = {
        name: formData.name.trim(),
        description: fullDescription,
        target_amount: Number(formData.target_amount)
      };

      const response = await apiService.updateProject(project.id, updateData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Project updated successfully!',
          position: 'top',
          visibilityTime: 2000,
        });
        
        setIsEditing(false);
        onProjectUpdated();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to update project',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update project',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!project) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!project) return;
    
    setShowDeleteConfirm(false);
    setLoading(true);
    
    try {
      const response = await apiService.deleteProject(project.id);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Project deleted successfully!',
          position: 'top',
          visibilityTime: 2000,
        });
        
        // Call callbacks after a short delay to show toast
        setTimeout(() => {
          onProjectDeleted();
          onClose();
        }, 500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to delete project',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to delete project',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  if (!project) return null;

  const progress = calculateProgress();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Project' : 'Project Details'}
              </Text>
              <View style={[
                styles.statusBadge,
                project.status === 'active' ? styles.activeStatus :
                project.status === 'completed' ? styles.completedStatus :
                styles.pendingStatus
              ]}>
                <Text style={styles.statusText}>{project.status}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {!isEditing ? (
              // VIEW MODE
              <>
                {/* Project Name */}
                <View style={styles.section}>
                  <Text style={styles.projectName}>{project.name}</Text>
                </View>

                {/* Progress Card */}
                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Funding Progress</Text>
                    <Text style={styles.progressPercentage}>{progress.toFixed(1)}%</Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                  </View>

                  <View style={styles.amountRow}>
                    <View>
                      <Text style={styles.amountLabel}>Collected</Text>
                      <Text style={styles.amountValue}>
                        ${project.collected_amount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.amountDivider} />
                    <View>
                      <Text style={styles.amountLabel}>Target</Text>
                      <Text style={styles.amountValue}>
                        ${project.target_amount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Project Details */}
                <View style={styles.detailsCard}>
                  <Text style={styles.sectionTitle}>Project Information</Text>
                  
                  {formData.category && (
                    <View style={styles.detailRow}>
                      <Ionicons name="pricetag-outline" size={20} color="#666" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Category</Text>
                        <Text style={styles.detailValue}>{formData.category}</Text>
                      </View>
                    </View>
                  )}

                  {formData.timeline && (
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Timeline</Text>
                        <Text style={styles.detailValue}>{formData.timeline}</Text>
                      </View>
                    </View>
                  )}

                  {formData.location && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={20} color="#666" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>{formData.location}</Text>
                      </View>
                    </View>
                  )}

                  {formData.target_beneficiaries && (
                    <View style={styles.detailRow}>
                      <Ionicons name="people-outline" size={20} color="#666" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Target Beneficiaries</Text>
                        <Text style={styles.detailValue}>{formData.target_beneficiaries}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Created</Text>
                      <Text style={styles.detailValue}>
                        {new Date(project.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Description */}
                {formData.description && (
                  <View style={styles.descriptionCard}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{formData.description}</Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                    disabled={loading}
                  >
                    <Ionicons name="pencil" size={20} color="white" />
                    <Text style={styles.editButtonText}>Edit Project</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={loading}
                  >
                    <Ionicons name="trash-outline" size={20} color="white" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // EDIT MODE
              <>
                {/* Project Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Project Name <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Enter project name"
                    value={formData.name}
                    onChangeText={(text) => {
                      setFormData({ ...formData, name: text });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                  />
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                {/* Category */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Category <Text style={styles.required}>*</Text>
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryButton,
                          formData.category === cat && styles.categoryButtonSelected
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, category: cat });
                          if (errors.category) setErrors({ ...errors, category: '' });
                        }}
                      >
                        <Text style={[
                          styles.categoryButtonText,
                          formData.category === cat && styles.categoryButtonTextSelected
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                </View>

                {/* Target Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Target Amount <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.target_amount && styles.inputError]}
                    placeholder="e.g., 50000"
                    value={formData.target_amount}
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      setFormData({ ...formData, target_amount: text });
                      if (errors.target_amount) setErrors({ ...errors, target_amount: '' });
                    }}
                  />
                  {errors.target_amount && <Text style={styles.errorText}>{errors.target_amount}</Text>}
                </View>

                {/* Timeline */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Timeline <Text style={styles.required}>*</Text>
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {timelines.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.categoryButton,
                          formData.timeline === time && styles.categoryButtonSelected
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, timeline: time });
                          if (errors.timeline) setErrors({ ...errors, timeline: '' });
                        }}
                      >
                        <Text style={[
                          styles.categoryButtonText,
                          formData.timeline === time && styles.categoryButtonTextSelected
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {errors.timeline && <Text style={styles.errorText}>{errors.timeline}</Text>}
                </View>

                {/* Location */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Project location"
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                  />
                </View>

                {/* Target Beneficiaries */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Target Beneficiaries</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 500 families"
                    value={formData.target_beneficiaries}
                    onChangeText={(text) => setFormData({ ...formData, target_beneficiaries: text })}
                  />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Project Description <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textArea, errors.description && styles.inputError]}
                    placeholder="Describe the project goals and impact..."
                    value={formData.description}
                    onChangeText={(text) => {
                      setFormData({ ...formData, description: text });
                      if (errors.description) setErrors({ ...errors, description: '' });
                    }}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                  {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                </View>

                {/* Edit Mode Buttons */}
                <View style={styles.editModeButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleUpdate}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="white" />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={showDeleteConfirm}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIconContainer}>
              <Ionicons name="warning" size={40} color="#f44336" />
            </View>
            <Text style={styles.confirmTitle}>Delete Project</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete &quot;{project?.name}&quot;?{'\n\n'}
              This action cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelConfirmButton]}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelConfirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteConfirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
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
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  closeButton: {
    padding: 4
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20
  },
  section: {
    marginBottom: 20
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  progressCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4fc3f7'
  },
  progressBarContainer: {
    marginBottom: 15
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4fc3f7',
    borderRadius: 6
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  amountDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0'
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  detailsCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 12
  },
  detailContent: {
    flex: 1
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500'
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4fc3f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8
  },
  editButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold'
  },
  deleteButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold'
  },
  // Edit Mode Styles
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  required: {
    color: '#f44336'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fafafa'
  },
  inputError: {
    borderColor: '#f44336'
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    minHeight: 120
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 5
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
    backgroundColor: '#fafafa'
  },
  categoryButtonSelected: {
    backgroundColor: '#4fc3f7',
    borderColor: '#4fc3f7'
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  categoryButtonTextSelected: {
    color: 'white',
    fontWeight: '600'
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4
  },
  editModeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: 'bold'
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4fc3f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold'
  },
  // Delete Confirmation Modal Styles
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  confirmIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelConfirmButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteConfirmButton: {
    backgroundColor: '#f44336',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  }
});

export default ProjectDetailsModal;
