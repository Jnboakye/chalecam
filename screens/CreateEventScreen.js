import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, serverTimestamp, arrayUnion, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generate6DigitCode } from '../utils/helpers';

const CreateEventScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000)); // 1 hour later
  const [requireApproval, setRequireApproval] = useState(false);
  const [showPhotosRealtime, setShowPhotosRealtime] = useState(true);
  const [maxCameraRollUploads, setMaxCameraRollUploads] = useState('10');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    if (!eventName.trim()) {
      Alert.alert('Error', 'Please enter an event name');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    const maxUploads = parseInt(maxCameraRollUploads, 10);
    if (isNaN(maxUploads) || maxUploads < 1) {
      Alert.alert('Error', 'Max uploads must be a positive number');
      return;
    }

    setLoading(true);

    try {
      const eventCode = generate6DigitCode();
      const eventData = {
        name: eventName.trim(),
        ownerId: user.uid,
        ownerName: user.displayName || user.email,
        startTime: startDate,
        endTime: endDate,
        requireApproval,
        showPhotosRealtime,
        maxCameraRollUploads: maxUploads,
        participants: [user.uid],
        pendingApprovals: [],
        eventCode,
        createdAt: serverTimestamp(),
        status: 'upcoming',
        totalPhotos: 0
      };

      const eventRef = await addDoc(collection(db, 'events'), eventData);

      // Update user's eventsCreated array
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        eventsCreated: arrayUnion(eventRef.id)
      });

      setLoading(false);
      Alert.alert('Success', 'Event created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('EventDetail', { eventId: eventRef.id })
        }
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create event: ' + error.message);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create New Event</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Event Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Birthday Party"
          value={eventName}
          onChangeText={setEventName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Start Date & Time</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.dateText}>{formatDateTime(startDate)}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="datetime"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        <Text style={styles.label}>End Date & Time</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.dateText}>{formatDateTime(endDate)}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="datetime"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.label}>Require approval for participants</Text>
            <Text style={styles.switchDescription}>
              Participants must be approved before joining
            </Text>
          </View>
          <Switch
            value={requireApproval}
            onValueChange={setRequireApproval}
            trackColor={{ false: '#ccc', true: '#6200EA' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.label}>Show photos in real-time</Text>
            <Text style={styles.switchDescription}>
              Photos appear immediately or after event ends
            </Text>
          </View>
          <Switch
            value={showPhotosRealtime}
            onValueChange={setShowPhotosRealtime}
            trackColor={{ false: '#ccc', true: '#6200EA' }}
            thumbColor="#fff"
          />
        </View>

        <Text style={styles.label}>Max camera roll uploads per person</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          value={maxCameraRollUploads}
          onChangeText={setMaxCameraRollUploads}
          keyboardType="numeric"
        />
        <Text style={styles.hint}>Unlimited in-app camera photos allowed</Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateEvent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Event</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200EA',
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: -12,
  },
  createButton: {
    backgroundColor: '#6200EA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateEventScreen;

