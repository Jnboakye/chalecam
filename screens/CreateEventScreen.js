import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
      <Text className="text-3xl font-bold text-primary mb-6">Create New Event</Text>

      <View className="gap-5">
        <View>
          <Text className="text-base font-semibold text-gray-800 mb-2">Event Name</Text>
          <TextInput
            className="bg-gray-100 rounded-lg p-4 text-base border border-gray-200"
            placeholder="e.g., Birthday Party"
            value={eventName}
            onChangeText={setEventName}
            autoCapitalize="words"
          />
        </View>

        <View>
          <Text className="text-base font-semibold text-gray-800 mb-2">Start Date & Time</Text>
          <TouchableOpacity
            className="bg-gray-100 rounded-lg p-4 border border-gray-200"
            onPress={() => setShowStartPicker(true)}
          >
            <Text className="text-base text-gray-800">{formatDateTime(startDate)}</Text>
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
        </View>

        <View>
          <Text className="text-base font-semibold text-gray-800 mb-2">End Date & Time</Text>
          <TouchableOpacity
            className="bg-gray-100 rounded-lg p-4 border border-gray-200"
            onPress={() => setShowEndPicker(true)}
          >
            <Text className="text-base text-gray-800">{formatDateTime(endDate)}</Text>
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
        </View>

        <View className="flex-row justify-between items-center py-2">
          <View className="flex-1 mr-4">
            <Text className="text-base font-semibold text-gray-800">Require approval for participants</Text>
            <Text className="text-xs text-gray-600 mt-1">
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

        <View className="flex-row justify-between items-center py-2">
          <View className="flex-1 mr-4">
            <Text className="text-base font-semibold text-gray-800">Show photos in real-time</Text>
            <Text className="text-xs text-gray-600 mt-1">
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

        <View>
          <Text className="text-base font-semibold text-gray-800 mb-2">Max camera roll uploads per person</Text>
          <TextInput
            className="bg-gray-100 rounded-lg p-4 text-base border border-gray-200"
            placeholder="10"
            value={maxCameraRollUploads}
            onChangeText={setMaxCameraRollUploads}
            keyboardType="numeric"
          />
          <Text className="text-xs text-gray-500 -mt-3">Unlimited in-app camera photos allowed</Text>
        </View>

        <TouchableOpacity
          className="bg-primary rounded-lg p-4 items-center mt-2"
          onPress={handleCreateEvent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-base font-semibold">Create Event</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateEventScreen;

