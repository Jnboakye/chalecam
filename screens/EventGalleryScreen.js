import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, orderBy, getDocs, doc, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { canViewEventPhotos, getPhotosRevealMessage, getEventStatus } from '../utils/helpers';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 32 - 16) / 3;

const EventGalleryScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const eventRef = doc(db, 'events', eventId);
    const unsubscribeEvent = onSnapshot(eventRef, (docSnap) => {
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() });
      }
    });
    return () => unsubscribeEvent();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    const photosQuery = query(
      collection(db, 'photos'),
      where('eventId', '==', eventId),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribePhotos = onSnapshot(photosQuery, (snapshot) => {
      const photosData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (event && !canViewEventPhotos(event)) {
        setPhotos([]);
      } else {
        setPhotos(photosData);
      }
      setLoading(false);
    });

    return () => unsubscribePhotos();
  }, [eventId, event]);

  const canView = event ? canViewEventPhotos(event) : false;
  const revealMessage = event ? getPhotosRevealMessage(event) : 'Loading…';
  const status = event ? getEventStatus(event.startTime, event.endTime) : null;
  const canUpload = status === 'active' && event?.participants?.includes(user?.uid);

  const compressImage = async (uri) => {
    try {
      const result = await manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      return result.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  };

  const uploadPhoto = async (uri, source) => {
    setUploading(true);
    try {
      const compressedUri = await compressImage(uri);
      const response = await fetch(compressedUri);
      const blob = await response.blob();

      const photoId = doc(collection(db, 'photos')).id;
      const storageRef = ref(storage, `events/${eventId}/photos/${photoId}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'photos'), {
        eventId,
        userId: user.uid,
        userName: user.displayName || user.email,
        downloadUrl,
        uploadedAt: serverTimestamp(),
        source,
      });

      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, { totalPhotos: increment(1) });

      setUploading(false);
      Alert.alert('Success', 'Photo uploaded successfully!');
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Failed to upload photo: ' + error.message);
    }
  };

  const handleTakePhoto = () => {
    navigation.navigate('Camera', { eventId });
  };

  const handleUploadFromGallery = async () => {
    try {
      const userPhotosQuery = query(
        collection(db, 'photos'),
        where('eventId', '==', eventId),
        where('userId', '==', user.uid),
        where('source', '==', 'camera_roll')
      );
      const userPhotosSnapshot = await getDocs(userPhotosQuery);
      const userPhotosCount = userPhotosSnapshot.size;
      const maxUploads = event?.maxCameraRollUploads ?? 10;
      const isUnlimited = maxUploads === -1;

      if (!isUnlimited && userPhotosCount >= maxUploads) {
        Alert.alert(
          'Upload limit',
          `You can upload up to ${maxUploads} photos from your gallery. You can still take photos with the camera.`
        );
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to your photos to upload.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        const remaining = isUnlimited ? result.assets.length : Math.min(maxUploads - userPhotosCount, result.assets.length);
        const toUpload = result.assets.slice(0, remaining);
        if (result.assets.length > toUpload.length) {
          Alert.alert('Limit', `Uploading ${toUpload.length} photo(s). You've reached your gallery limit.`);
        }
        for (const asset of toUpload) {
          await uploadPhoto(asset.uri, 'camera_roll');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photos: ' + error.message);
    }
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity
      style={[styles.photoCell, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('PhotoDetail', { photo: item, photos })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.downloadUrl }} style={styles.photoImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  if (loading && !event) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={[styles.backCircle, { backgroundColor: colors.surface }]}>
            <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {event?.name || 'Photos'}
        </Text>
      </View>

      {!canView ? (
        <View style={[styles.lockedContainer, { paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }]}>
          {event?.coverImageUrl ? (
            <View style={[styles.coverWrap, { borderRadius: 16, overflow: 'hidden', backgroundColor: colors.card }]}>
              <Image source={{ uri: event.coverImageUrl }} style={styles.coverImage} resizeMode="cover" />
              <View style={[styles.coverOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
            </View>
          ) : (
            <View style={[styles.placeholderCover, { backgroundColor: colors.surface }]}>
              <Text style={[styles.placeholderEmoji, { color: colors.textSecondary }]}>📷</Text>
            </View>
          )}
          <Text style={[styles.lockedTitle, { color: colors.text }]}>See photos</Text>
          <Text style={[styles.lockedMessage, { color: colors.textSecondary }]}>{revealMessage}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (canUpload ? 100 : 24) }]}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No photos yet</Text>
                {canUpload && (
                  <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>Take or upload photos to get started</Text>
                )}
              </View>
            }
          />

          {canUpload && (
            <View style={[styles.fabRow, { bottom: insets.bottom + 24 }]}>
              <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={handleUploadFromGallery}
                disabled={uploading}
              >
                <Text style={styles.fabIcon}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fabPrimary, { backgroundColor: colors.primary }]}
                onPress={handleTakePhoto}
                disabled={uploading}
              >
                <Text style={styles.fabIcon}>📸</Text>
              </TouchableOpacity>
            </View>
          )}

          {uploading && (
            <View style={[styles.uploadOverlay, StyleSheet.absoluteFill]}>
              <View style={[styles.uploadCard, { backgroundColor: colors.card }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.uploadText, { color: colors.text }]}>Uploading…</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
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
  backCircle: {
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
  listContent: {
    padding: 8,
    flexGrow: 1,
  },
  photoCell: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 8,
  },
  fabRow: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
  },
  uploadOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadCard: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 160,
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  coverWrap: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 16 / 9,
    marginBottom: 24,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderCover: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 16 / 9,
    marginBottom: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default EventGalleryScreen;
