import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
        <View style={styles.container}>
          <Text>Requesting camera permission...</Text>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Camera permission denied</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Request Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { marginTop: 12, backgroundColor: '#666' }]}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerText}>Scan QR Code</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            setShowScanner(false);
            setScanned(false);
          }}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join an Event</Text>
      <Text style={styles.subtitle}>Scan a QR code or enter an event code</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setShowScanner(true)}
          disabled={loading}
        >
          <Text style={styles.optionButtonText}>📷 Scan QR Code</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>Enter 6-Digit Event Code</Text>
        <TextInput
          style={styles.input}
          placeholder="000000"
          value={eventCode}
          onChangeText={setEventCode}
          keyboardType="numeric"
          maxLength={6}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleJoinByCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Join Event</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200EA',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#6200EA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
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
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#6200EA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#6200EA',
    borderRadius: 12,
  },
  scannerText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#6200EA',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default JoinEventScreen;

