// app/(tabs)/beneficiary.tsx
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { useState, useEffect } from "react";
import { apiService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function BeneficiaryScreen() {
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<number>(0);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const applicationTypes = [
    { label: 'Financial Aid', value: 'financial' },
    { label: 'Material/Items', value: 'material' },
    { label: 'Service/Support', value: 'service' },
    { label: 'Emergency Relief', value: 'emergency' },
    { label: 'Other', value: 'other' }
  ];

  const categories = [
    { label: 'Education', value: 'education' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Food & Nutrition', value: 'food' },
    { label: 'Shelter', value: 'shelter' },
    { label: 'Emergency Relief', value: 'emergency' },
    { label: 'Community Development', value: 'community' },
    { label: 'Other', value: 'other' }
  ];
  
  const [form, setForm] = useState({
    beneficiary_id: 0,
    title: "",
    description: "",
    category: "education",
    application_type: "financial",
    target_amount: "",
    location: "",
    items_requested: "",
    reason: "",
    image_url: "",
    start_date: "",
    end_date: "",
    voice_recording_url: "",
    documents: ""
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Loaded user data:', user); // Debug log
        setUserId(user.id || 0);
        setForm(prev => ({ 
          ...prev, 
          beneficiary_id: user.id || 0
        }));
      } else {
        console.log('No user data found in AsyncStorage');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.title.trim()) {
      Alert.alert("Error", "Please provide a title for your application");
      return;
    }
    
    if (!form.beneficiary_id || form.beneficiary_id === 0) {
      Alert.alert("Error", "User information not loaded. Please try again.");
      return;
    }
    
    if (!form.description.trim()) {
      Alert.alert("Error", "Please provide a description");
      return;
    }

    if (!form.category) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    
    if (!form.application_type) {
      Alert.alert("Error", "Please select an application type");
      return;
    }

    if (!form.target_amount || parseFloat(form.target_amount) <= 0) {
      Alert.alert("Error", "Please provide a valid target amount");
      return;
    }

    if (!form.location.trim()) {
      Alert.alert("Error", "Please provide a location");
      return;
    }

    if (!form.reason.trim()) {
      Alert.alert("Error", "Please provide a reason for your application");
      return;
    }

    try {
      setSubmitting(true);
      
      const applicationData = {
        beneficiary_id: form.beneficiary_id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        application_type: form.application_type,
        target_amount: parseFloat(form.target_amount),
        location: form.location.trim(),
        items_requested: form.items_requested.trim() || undefined,
        reason: form.reason.trim(),
        image_url: form.image_url.trim() || undefined,
        start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
        end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
        voice_recording_url: form.voice_recording_url.trim() || undefined,
        documents: form.documents.trim() || undefined
      };

      console.log('Submitting application data:', applicationData);
      await apiService.createApplication(applicationData);

      Alert.alert("Success", "Application submitted successfully!");
      setForm({ 
        beneficiary_id: userId,
        title: "",
        description: "",
        category: "education",
        application_type: "financial",
        target_amount: "",
        location: "",
        items_requested: "",
        reason: "",
        image_url: "",
        start_date: "",
        end_date: "",
        voice_recording_url: "",
        documents: ""
      });
      setStartDate(undefined);
      setEndDate(undefined);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aid Application</Text>
        <Text style={styles.headerSubtitle}>
          Apply for aid and track your application status
        </Text>
      </View>
      
      {/* Application Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Submit New Application</Text>
        
        {(!userId || userId === 0) && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ Loading user information...</Text>
          </View>
        )}
        
        {/* Title */}
        <Text style={styles.label}>Application Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Emergency Medical Fund Request"
          value={form.title}
          onChangeText={(text) => setForm({...form, title: text})}
        />

        {/* Category Selection */}
        <Text style={styles.label}>Category *</Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowCategoryPicker(true)}
        >
          <Text style={styles.selectedText}>
            {categories.find(c => c.value === form.category)?.label || 'Education'}
          </Text>
        </TouchableOpacity>

        {/* Application Type */}
        <Text style={styles.label}>Application Type *</Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowTypePicker(true)}
        >
          <Text style={styles.selectedText}>
            {applicationTypes.find(t => t.value === form.application_type)?.label || 'Financial Aid'}
          </Text>
        </TouchableOpacity>

        {/* Description */}
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detailed description of your needs"
          value={form.description}
          onChangeText={(text) => setForm({...form, description: text})}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Target Amount */}
        <Text style={styles.label}>Target Amount (LKR) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 50000"
          value={form.target_amount}
          onChangeText={(text) => setForm({...form, target_amount: text})}
          keyboardType="numeric"
        />

        {/* Location */}
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Colombo, Sri Lanka"
          value={form.location}
          onChangeText={(text) => setForm({...form, location: text})}
        />

        {/* Items Requested (optional) */}
        <Text style={styles.label}>Items Requested (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="List specific items if applicable"
          value={form.items_requested}
          onChangeText={(text) => setForm({...form, items_requested: text})}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Reason */}
        <Text style={styles.label}>Reason for Application *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Why do you need this support?"
          value={form.reason}
          onChangeText={(text) => setForm({...form, reason: text})}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Image URL (optional) */}
        <Text style={styles.label}>Image URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.jpg"
          value={form.image_url}
          onChangeText={(text) => setForm({...form, image_url: text})}
          autoCapitalize="none"
        />

        {/* Start Date (optional) */}
        <Text style={styles.label}>Start Date (Optional)</Text>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity 
            style={[styles.pickerButton, styles.datePickerButton]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={startDate ? styles.selectedText : styles.placeholderText}>
              {startDate ? startDate.toLocaleDateString() : 'Select start date...'}
            </Text>
          </TouchableOpacity>
          {startDate && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setStartDate(undefined)}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* End Date (optional) */}
        <Text style={styles.label}>End Date (Optional)</Text>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity 
            style={[styles.pickerButton, styles.datePickerButton]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={endDate ? styles.selectedText : styles.placeholderText}>
              {endDate ? endDate.toLocaleDateString() : 'Select end date...'}
            </Text>
          </TouchableOpacity>
          {endDate && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setEndDate(undefined)}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Voice Recording URL */}
        <Text style={styles.label}>Voice Recording URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/recording.mp3"
          value={form.voice_recording_url}
          onChangeText={(text) => setForm({...form, voice_recording_url: text})}
          autoCapitalize="none"
        />

        {/* Documents */}
        <Text style={styles.label}>Supporting Documents URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/document.pdf"
          value={form.documents}
          onChangeText={(text) => setForm({...form, documents: text})}
          autoCapitalize="none"
        />
        
        <TouchableOpacity 
          style={[styles.button, submitting && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.modalScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={styles.modalItem}
                  onPress={() => {
                    setForm({...form, category: category.value});
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Application Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Application Type</Text>
            <ScrollView style={styles.modalScroll}>
              {applicationTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.modalItem}
                  onPress={() => {
                    setForm({...form, application_type: type.value});
                    setShowTypePicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowTypePicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Start Date Picker */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}

      {/* End Date Picker */}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          minimumDate={startDate || new Date()}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 0,
    backgroundColor: '#f8fdff'
  },
  header: {
    backgroundColor: '#4fc3f7',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
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
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 8, 
    textAlign: "center",
    color: '#333'
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    color: '#666',
    marginBottom: 25
  },
  formSection: {
    marginBottom: 30,
    marginHorizontal: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#333',
    marginBottom: 15
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 5
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    padding: 12, 
    marginBottom: 15, 
    borderRadius: 8,
    backgroundColor: "white",
    fontSize: 16
  },
  textArea: { 
    height: 100, 
    textAlignVertical: "top",
    paddingTop: 12
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "white",
    overflow: 'hidden'
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "white",
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  datePickerButton: {
    flex: 1,
    marginBottom: 0,
  },
  clearButton: {
    backgroundColor: '#f44336',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: "#4fc3f7",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },
  buttonDisabled: {
    backgroundColor: '#b0bec5'
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalItemDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  modalCloseButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
  }
});
