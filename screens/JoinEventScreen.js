import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const JoinEventScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [eventCode, setEventCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    await joinEvent(data);
  };

  const handleJoinByCode = async () => {
    if (!eventCode.trim()) {
      Alert.alert('Error', 'Please enter an event code');
      return;
    }

    if (eventCode.length !== 6) {
      Alert.alert('Error', 'Event code must be 6 digits');
      return;
    }

    await joinEventByCode(eventCode.trim());
  };

  const joinEventByCode = async (code) => {
    setLoading(true);
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('eventCode', '==', code)
      );
      const querySnapshot = await getDocs(eventsQuery);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Event not found. Please check the code.');
        setLoading(false);
        return;
      }

      const eventDoc = querySnapshot.docs[0];
      await joinEvent(eventDoc.id);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to join event: ' + error.message);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);

      if (!eventDoc.exists()) {
        Alert.alert('Error', 'Event not found');
        setLoading(false);
        return;
      }

      const eventData = eventDoc.data();

      // Check if already a participant
      if (eventData.participants?.includes(user.uid)) {
        Alert.alert('Info', 'You are already a participant in this event');
        setLoading(false);
        navigation.navigate('EventDetail', { eventId });
        return;
      }

      // Check if already pending
      if (eventData.pendingApprovals?.includes(user.uid)) {
        Alert.alert('Info', 'Your request is pending approval');
        setLoading(false);
        navigation.navigate('EventDetail', { eventId });
        return;
      }

      if (eventData.requireApproval) {
        // Add to pending approvals
        await updateDoc(eventRef, {
          pendingApprovals: arrayUnion(user.uid),
        });
        Alert.alert(
          'Request Sent',
          'Your request has been sent. Waiting for approval from the event owner.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('EventDetail', { eventId }),
            },
          ]
        );
      } else {
        // Add directly to participants
        await updateDoc(eventRef, {
          participants: arrayUnion(user.uid),
        });

        // Update user's eventsJoined array
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          eventsJoined: arrayUnion(eventId),
        });

        Alert.alert('Success', 'You have joined the event!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('EventDetail', { eventId }),
          },
        ]);
      }

      setLoading(false);
      setScanned(false);
      setShowScanner(false);
    } catch (error) {
      setLoading(false);
      setScanned(false);
      Alert.alert('Error', 'Failed to join event: ' + error.message);
    }
  };

  if (showScanner) {
    if (!permission) {
      return (
        <View className="flex-1 bg-white p-5 justify-center">
          <Text>Requesting camera permission...</Text>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View className="flex-1 bg-white p-5 justify-center">
          <Text className="text-red-500 text-base text-center mb-5">Camera permission denied</Text>
          <TouchableOpacity
            className="bg-primary rounded-lg p-4 items-center"
            onPress={requestPermission}
          >
            <Text className="text-white text-base font-semibold">Request Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-600 rounded-lg p-4 items-center mt-3"
            onPress={() => setShowScanner(false)}
          >
            <Text className="text-white text-base font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 bg-black">
        <CameraView
          className="absolute inset-0"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <View className="flex-1 justify-center items-center">
          <View className="w-64 h-64 border-2 border-primary rounded-xl" />
          <Text className="text-white text-lg mt-5 font-semibold">Scan QR Code</Text>
        </View>
        <TouchableOpacity
          className="absolute bottom-10 self-center bg-primary px-8 py-3 rounded-lg"
          onPress={() => {
            setShowScanner(false);
            setScanned(false);
          }}
        >
          <Text className="text-white text-base font-semibold">Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-5 justify-center">
      <Text className="text-3xl font-bold text-primary text-center mb-2">Join an Event</Text>
      <Text className="text-base text-gray-600 text-center mb-10">Scan a QR code or enter an event code</Text>

      <View className="w-full">
        <TouchableOpacity
          className="bg-primary rounded-lg p-4 items-center mb-6"
          onPress={() => setShowScanner(true)}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold">📷 Scan QR Code</Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-4 text-gray-500 text-sm">OR</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        <Text className="text-base font-semibold text-gray-800 mb-2">Enter 6-Digit Event Code</Text>
        <TextInput
          className="bg-gray-100 rounded-lg p-4 text-lg text-center tracking-widest mb-4 border border-gray-200"
          placeholder="000000"
          value={eventCode}
          onChangeText={setEventCode}
          keyboardType="numeric"
          maxLength={6}
          autoCapitalize="none"
        />

        <TouchableOpacity
          className={`bg-primary rounded-lg p-4 items-center ${loading ? 'opacity-60' : ''}`}
          onPress={handleJoinByCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-base font-semibold">Join Event</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JoinEventScreen;

