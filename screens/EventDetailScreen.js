import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import { formatDate, getEventStatus } from '../utils/helpers';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    if (!eventId) return;

    const eventRef = doc(db, 'events', eventId);
    const unsubscribe = onSnapshot(eventRef, async (docSnap) => {
      if (docSnap.exists()) {
        const eventData = { id: docSnap.id, ...docSnap.data() };
        setEvent(eventData);

        // Fetch pending user details
        if (eventData.pendingApprovals && eventData.pendingApprovals.length > 0) {
          const userPromises = eventData.pendingApprovals.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return userDoc.exists() ? { uid: userId, ...userDoc.data() } : null;
          });
          const users = (await Promise.all(userPromises)).filter(Boolean);
          setPendingUsers(users);
        } else {
          setPendingUsers([]);
        }

        setLoading(false);
      } else {
        Alert.alert('Error', 'Event not found');
        navigation.goBack();
      }
    });

    return unsubscribe;
  }, [eventId]);

  const isOwner = event?.ownerId === user?.uid;
  const isParticipant = event?.participants?.includes(user?.uid);
  const isPending = event?.pendingApprovals?.includes(user?.uid);
  const status = event ? getEventStatus(event.startTime, event.endTime) : null;

  const handleApprove = async (userId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        participants: arrayUnion(userId),
        pendingApprovals: arrayRemove(userId),
      });

      // Update user's eventsJoined array
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          eventsJoined: arrayUnion(eventId),
        });
      }

      Alert.alert('Success', 'User approved');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve user: ' + error.message);
    }
  };

  const handleReject = async (userId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        pendingApprovals: arrayRemove(userId),
      });
      Alert.alert('Success', 'User rejected');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject user: ' + error.message);
    }
  };

  const handleShareCode = () => {
    Alert.alert('Event Code', `Share this code: ${event.eventCode}`, [{ text: 'OK' }]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EA" />
      </View>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Event Info Card */}
      <View style={styles.card}>
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.ownerText}>Created by {event.ownerName}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Start:</Text>
          <Text style={styles.value}>{formatDate(event.startTime)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>End:</Text>
          <Text style={styles.value}>{formatDate(event.endTime)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: status === 'active' ? '#4CAF50' : '#666' }]}>
            {status?.toUpperCase()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Participants:</Text>
          <Text style={styles.value}>{event.participants?.length || 0}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Photos:</Text>
          <Text style={styles.value}>{event.totalPhotos || 0}</Text>
        </View>
      </View>

      {/* QR Code (Owner only) */}
      {isOwner && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode value={eventId} size={200} />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleShareCode}>
            <Text style={styles.buttonText}>Share Event Code</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pending Approvals (Owner only) */}
      {isOwner && event.requireApproval && pendingUsers.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pending Approvals</Text>
          {pendingUsers.map((pendingUser) => (
            <View key={pendingUser.uid} style={styles.pendingUserRow}>
              <View style={styles.pendingUserInfo}>
                <Text style={styles.pendingUserName}>
                  {pendingUser.displayName || pendingUser.email}
                </Text>
                <Text style={styles.pendingUserEmail}>{pendingUser.email}</Text>
              </View>
              <View style={styles.approvalButtons}>
                <TouchableOpacity
                  style={[styles.approvalButton, styles.approveButton]}
                  onPress={() => handleApprove(pendingUser.uid)}
                >
                  <Text style={styles.approvalButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.approvalButton, styles.rejectButton]}
                  onPress={() => handleReject(pendingUser.uid)}
                >
                  <Text style={styles.approvalButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Participant Status */}
      {!isOwner && (
        <View style={styles.card}>
          {isPending ? (
            <View style={styles.statusBanner}>
              <Text style={styles.statusBannerText}>
                ⏳ Waiting for approval from event owner
              </Text>
            </View>
          ) : isParticipant ? (
            <View style={styles.statusBanner}>
              <Text style={[styles.statusBannerText, { color: '#4CAF50' }]}>
                ✅ You are a participant
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* View Photos Button */}
      {(isOwner || (isParticipant && !isPending)) && (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('EventGallery', { eventId: event.id })}
          >
            <Text style={styles.primaryButtonText}>View Photos</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ownerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#6200EA',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pendingUserInfo: {
    flex: 1,
  },
  pendingUserName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  pendingUserEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approvalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  approvalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  statusBannerText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#6200EA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventDetailScreen;

