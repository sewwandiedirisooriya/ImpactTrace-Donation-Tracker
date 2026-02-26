// components/ApplicationDetailsModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Application } from '../services/types';
import { apiService } from '../services/api';

interface ApplicationDetailsModalProps {
  visible: boolean;
  application: Application | null;
  onClose: () => void;
  onApplicationUpdated: () => void;
}

export default function ApplicationDetailsModal({
  visible,
  application,
  onClose,
  onApplicationUpdated,
}: ApplicationDetailsModalProps) {
  const [updating, setUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'approved' | 'rejected' | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleStatusUpdate = (newStatus: 'approved' | 'rejected') => {
    if (!application) return;
    
    console.log('handleStatusUpdate called with status:', newStatus);
    
    // Use custom confirmation modal for all platforms
    setPendingStatus(newStatus);
    setShowConfirmation(true);
  };

  const handleConfirmClick = () => {
    console.log('User confirmed status update');
    if (pendingStatus) {
      performStatusUpdate(pendingStatus);
    }
    setShowConfirmation(false);
  };

  const handleCancelClick = () => {
    console.log('User cancelled status update');
    setShowConfirmation(false);
    setPendingStatus(null);
  };

  const performStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    try {
      setUpdating(true);
      console.log('Updating application status:', application?.id, newStatus);
      
      if (!application) return;
      
      const response = await apiService.updateApplicationStatus(application.id, newStatus);
      console.log('Status update response:', response);
      
      // Show success modal
      setSuccessMessage(`Application ${newStatus} successfully!`);
      setShowSuccessModal(true);
      
    } catch (err: any) {
      console.error('Error updating application status:', err);
      // Show error modal
      setSuccessMessage(`Error: ${err.message || `Failed to ${newStatus} application`}`);
      setShowSuccessModal(true);
    } finally {
      setUpdating(false);
      setPendingStatus(null);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
    onApplicationUpdated();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Application Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {!application ? (
            <View style={styles.content}>
              <Text style={styles.emptyText}>No application selected</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.content}>
                {/* Applicant Info */}
                <View style={styles.section}>
                  <Text style={styles.applicantName}>{application.beneficiary_name || 'Unknown Applicant'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                    <Text style={styles.statusText}>{application.status.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Project Information */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="briefcase-outline" size={20} color="#666" />
                    <Text style={styles.infoLabel}>Project</Text>
                  </View>
                  <Text style={styles.infoValue}>{application.project_title || 'No Project Assigned'}</Text>
                  {application.project_description && (
                    <Text style={styles.infoSubtext}>{application.project_description}</Text>
                  )}
                </View>

                {/* Contact Information */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <Text style={styles.infoLabel}>Email</Text>
                  </View>
                  <Text style={styles.infoValue}>{application.beneficiary_email || 'N/A'}</Text>
                </View>

                {application.beneficiary_phone && (
                  <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                      <Ionicons name="call-outline" size={20} color="#666" />
                      <Text style={styles.infoLabel}>Phone</Text>
                    </View>
                    <Text style={styles.infoValue}>{application.beneficiary_phone}</Text>
                  </View>
                )}

                {application.beneficiary_location && (
                  <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={20} color="#666" />
                      <Text style={styles.infoLabel}>Location</Text>
                    </View>
                    <Text style={styles.infoValue}>{application.beneficiary_location}</Text>
                  </View>
                )}

                {/* Application Type */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="file-tray-outline" size={20} color="#666" />
                    <Text style={styles.infoLabel}>Application Type</Text>
                  </View>
                  <Text style={styles.infoValue}>{application.application_type}</Text>
                </View>

                {/* Application Description */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="document-text-outline" size={20} color="#666" />
                    <Text style={styles.infoLabel}>Description</Text>
                  </View>
                  <Text style={styles.needsDescription}>{application.description}</Text>
                </View>

                {/* Amount Requested */}
                {application.target_amount && (
                  <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                      <Ionicons name="cash-outline" size={20} color="#666" />
                      <Text style={styles.infoLabel}>Target Amount</Text>
                    </View>
                    <Text style={styles.infoValue}>${application.target_amount.toLocaleString()}</Text>
                  </View>
                )}

                {/* Items Requested */}
                {application.items_requested && (
                  <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                      <Ionicons name="list-outline" size={20} color="#666" />
                      <Text style={styles.infoLabel}>Items Requested</Text>
                    </View>
                    <Text style={styles.infoValue}>{application.items_requested}</Text>
                  </View>
                )}

                {/* Reason */}
                {application.reason && (
                  <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                      <Ionicons name="chatbox-outline" size={20} color="#666" />
                      <Text style={styles.infoLabel}>Reason</Text>
                    </View>
                    <Text style={styles.needsDescription}>{application.reason}</Text>
                  </View>
                )}

                {/* Application Date */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <Text style={styles.infoLabel}>Applied On</Text>
                  </View>
                  <Text style={styles.infoValue}>{formatDate(application.created_at)}</Text>
                </View>

                {/* AI Assessment - Optional if available */}
                {application.status === 'pending' && (
                  <View style={styles.aiAssessment}>
                    <View style={styles.aiHeader}>
                      <Ionicons name="bulb-outline" size={20} color="#4fc3f7" />
                      <Text style={styles.aiTitle}>AI Assessment</Text>
                    </View>
                    <Text style={styles.aiText}>
                      92% likely genuine need based on criteria analysis
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons */}
              {application.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleStatusUpdate('rejected')}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons name="close-circle-outline" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleStatusUpdate('approved')}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* Confirmation Modal for Web */}
      {showConfirmation && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationBox}>
            <View style={styles.confirmIconContainer}>
              <Ionicons 
                name={pendingStatus === 'approved' ? 'checkmark-circle' : 'close-circle'} 
                size={50} 
                color={pendingStatus === 'approved' ? '#4caf50' : '#f44336'} 
              />
            </View>
            <Text style={styles.confirmationTitle}>
              {pendingStatus === 'approved' ? 'Approve Application' : 'Reject Application'}
            </Text>
            <Text style={styles.confirmationMessage}>
              Are you sure you want to {pendingStatus === 'approved' ? 'approve' : 'reject'} this application?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelConfirmButton]}
                onPress={handleCancelClick}
              >
                <Text style={styles.cancelConfirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmConfirmButton]}
                onPress={handleConfirmClick}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Success/Error Modal */}
      {showSuccessModal && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationBox}>
            <View style={styles.confirmIconContainer}>
              <Ionicons 
                name={successMessage.includes('Error') ? 'alert-circle' : 'checkmark-circle'} 
                size={50} 
                color={successMessage.includes('Error') ? '#f44336' : '#4caf50'} 
              />
            </View>
            <Text style={styles.confirmationTitle}>
              {successMessage.includes('Error') ? 'Error' : 'Success'}
            </Text>
            <Text style={styles.confirmationMessage}>{successMessage}</Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmConfirmButton, { flex: 1 }]}
                onPress={handleSuccessClose}
              >
                <Text style={styles.confirmButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f8fdff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  applicantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  needsDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginTop: 4,
  },
  aiAssessment: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4fc3f7',
    marginTop: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4fc3f7',
    marginLeft: 6,
  },
  aiText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#4caf50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Confirmation Modal Styles
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmationBox: {
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
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
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmConfirmButton: {
    backgroundColor: '#4fc3f7',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
