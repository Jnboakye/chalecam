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
        <View style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 20, justifyContent: 'center' }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Requesting camera permission...</Text>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 20, justifyContent: 'center' }}>
          <Text style={{ color: '#ff4444', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>Camera permission denied</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#9b59b6', borderRadius: 12, padding: 16, alignItems: 'center' }}
            onPress={requestPermission}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Request Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#666', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 }}
            onPress={() => setShowScanner(false)}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 256, height: 256, borderWidth: 2, borderColor: '#9b59b6', borderRadius: 16 }} />
          <Text style={{ color: '#fff', fontSize: 18, marginTop: 20, fontWeight: '600' }}>Scan QR Code</Text>
        </View>
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#9b59b6', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 }}
          onPress={() => {
            setShowScanner(false);
            setScanned(false);
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 }}>Join an Event</Text>
      <Text style={{ fontSize: 16, color: '#999', textAlign: 'center', marginBottom: 40 }}>Scan a QR code or enter an event code</Text>

      <View style={{ width: '100%' }}>
        <TouchableOpacity
          style={{ backgroundColor: '#9b59b6', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24 }}
          onPress={() => setShowScanner(true)}
          disabled={loading}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>📷 Scan QR Code</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
          <Text style={{ marginHorizontal: 16, color: '#666', fontSize: 14 }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Enter 6-Digit Event Code</Text>
        <TextInput
          style={{ backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, fontSize: 18, textAlign: 'center', letterSpacing: 8, marginBottom: 16, borderWidth: 1, borderColor: '#333', color: '#fff' }}
          placeholder="000000"
          placeholderTextColor="#666"
          value={eventCode}
          onChangeText={setEventCode}
          keyboardType="numeric"
          maxLength={6}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={{ backgroundColor: '#9b59b6', borderRadius: 12, padding: 16, alignItems: 'center', opacity: loading ? 0.6 : 1 }}
          onPress={handleJoinByCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Join Event</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JoinEventScreen;

