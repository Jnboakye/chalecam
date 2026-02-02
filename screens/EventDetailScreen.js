import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import QRCode from 'react-native-qrcode-svg';
import { formatDate, getEventStatus } from '../utils/helpers';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }}
        >
          <View style={[styles.backButtonCircle, { backgroundColor: colors.surface }]}>
            <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {event.name}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event info card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.eventName, { color: colors.text }]}>{event.name}</Text>
          <Text style={[styles.ownerText, { color: colors.textSecondary }]}>
            Created by {event.ownerName}
          </Text>

          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Start</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{formatDate(event.startTime)}</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>End</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{formatDate(event.endTime)}</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Status</Text>
            <Text
              style={[
                styles.rowValue,
                styles.statusText,
                { color: status === 'active' ? colors.success : colors.text },
              ]}
            >
              {status?.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Participants</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              {event.participants?.length || 0}
            </Text>
          </View>
          <View style={[styles.rowLast, { borderBottomColor: 'transparent' }]}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Photos</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{event.totalPhotos || 0}</Text>
          </View>
        </View>

        {/* QR code (owner only) */}
        {isOwner && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>QR Code</Text>
            <View style={styles.qrWrap}>
              <View style={styles.qrBackground}>
                <QRCode value={eventId} size={200} backgroundColor="#fff" color="#0f172a" />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleShareCode}
            >
              <Text style={styles.primaryButtonText}>Share event code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pending approvals (owner only) */}
        {isOwner && event.requireApproval && pendingUsers.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending approvals</Text>
            {pendingUsers.map((pendingUser) => (
              <View
                key={pendingUser.uid}
                style={[styles.pendingRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.pendingInfo}>
                  <Text style={[styles.pendingName, { color: colors.text }]}>
                    {pendingUser.displayName || pendingUser.email}
                  </Text>
                  <Text style={[styles.pendingEmail, { color: colors.textSecondary }]}>
                    {pendingUser.email}
                  </Text>
                </View>
                <View style={styles.pendingActions}>
                  <TouchableOpacity
                    style={[styles.approveButton, { backgroundColor: colors.success }]}
                    onPress={() => handleApprove(pendingUser.uid)}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectButton, { backgroundColor: colors.error }]}
                    onPress={() => handleReject(pendingUser.uid)}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Participant status (non-owner) */}
        {!isOwner && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {isPending ? (
              <View style={[styles.statusBanner, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statusBannerText, { color: colors.text }]}>
                  Waiting for approval from event owner
                </Text>
              </View>
            ) : isParticipant ? (
              <View style={[styles.statusBanner, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statusBannerText, { color: colors.success }]}>
                  You are a participant
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* View photos */}
        {(isOwner || (isParticipant && !isPending)) && (
          <View style={styles.bottomCard}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.viewPhotosButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('EventGallery', { eventId: event.id })}
            >
              <Text style={styles.primaryButtonText}>View photos</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ownerText: {
    fontSize: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
  },
  statusText: {
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  qrWrap: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrBackground: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingName: {
    fontSize: 15,
    fontWeight: '600',
  },
  pendingEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  approveButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rejectButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBanner: {
    padding: 16,
    borderRadius: 12,
  },
  statusBannerText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomCard: {
    marginBottom: 16,
  },
  viewPhotosButton: {
    paddingVertical: 16,
  },
});

export default EventDetailScreen;
