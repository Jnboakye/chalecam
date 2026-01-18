import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, addDoc, serverTimestamp, arrayUnion, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generate6DigitCode } from '../utils/helpers';

const EventSummaryScreen = ({ navigation, route }) => {
  const { eventData = {} } = route.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRevealText = (reveal) => {
    switch (reveal) {
      case 'during':
        return 'Open during event';
      case 'after':
        return 'After event';
      case 'hidden':
        return 'Hidden';
      default:
        return 'Open during event';
    }
  };

  const getPhotosText = () => {
    if (eventData.unlimitedPhotos) {
      return 'Unlimited';
    }
    return `Max ${eventData.photosPerGuest || 5}`;
  };

  const uploadCoverImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageId = doc(collection(db, 'photos')).id;
      const storageRef = ref(storage, `events/covers/${imageId}.jpg`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      return null;
    }
  };

  const handleSaveEvent = async () => {
    if (!eventData.name) {
      Alert.alert('Error', 'Event name is required');
      return;
    }

    setLoading(true);

    try {
      let coverImageUrl = null;
      if (eventData.coverImage) {
        coverImageUrl = await uploadCoverImage(eventData.coverImage);
      }

      const eventCode = generate6DigitCode();
      const eventDataToSave = {
        name: eventData.name,
        ownerId: user.uid,
        ownerName: user.displayName || user.email,
        startTime: eventData.startDate || new Date(),
        endTime: eventData.endDate || new Date(Date.now() + 3600000),
        showPhotosRealtime: eventData.revealPhotos === 'during',
        revealPhotos: eventData.revealPhotos || 'during',
        maxGuests: eventData.maxGuests || 7,
        maxCameraRollUploads: eventData.unlimitedPhotos ? -1 : (eventData.photosPerGuest || 5),
        unlimitedPhotos: eventData.unlimitedPhotos || false,
        coverImageUrl,
        participants: [user.uid],
        pendingApprovals: [],
        eventCode,
        createdAt: serverTimestamp(),
        status: 'upcoming',
        totalPhotos: 0,
      };

      const eventRef = await addDoc(collection(db, 'events'), eventDataToSave);

      // Update user's eventsCreated array
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        eventsCreated: arrayUnion(eventRef.id),
      });

      setLoading(false);
      Alert.alert('Success', 'Event created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset navigation stack and navigate to event detail
            navigation.reset({
              index: 1,
              routes: [
                { name: 'MainTabs' },
                { name: 'EventDetail', params: { eventId: eventRef.id } },
              ],
            });
          },
        },
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create event: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonCircle}>
            <Text style={styles.backArrow}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Event Preview</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {eventData.coverImage && (
          <View style={styles.coverImageContainer}>
            <Image
              source={{ uri: eventData.coverImage }}
              style={styles.coverImage}
            />
            <View style={styles.coverOverlay}>
              <Text style={styles.eventNameOnCover}>{eventData.name}</Text>
              <Text style={styles.eventDateOnCover}>
                {formatDate(eventData.startDate)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.detailsContainer}>
          <DetailRow label="Start date" value={formatDate(eventData.startDate)} />
          <DetailRow label="End date" value={formatDate(eventData.endDate)} />
          <DetailRow
            label="Album reveal"
            value={getRevealText(eventData.revealPhotos)}
          />
          <DetailRow label="Guests" value={`Max ${eventData.maxGuests || 7} guests`} />
          <DetailRow label="Photos per guest" value={getPhotosText()} />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSaveEvent}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save event</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const DetailRow = ({ label, value }) => (
  <TouchableOpacity style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={styles.detailValueContainer}>
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailArrow}>→</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  coverImageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  eventNameOnCover: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  eventDateOnCover: {
    fontSize: 16,
    color: '#fff',
  },
  detailsContainer: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  detailArrow: {
    fontSize: 18,
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#9b59b6',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventSummaryScreen;
