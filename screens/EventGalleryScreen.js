import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { doc, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 32 - 16) / 3; // 3 columns with padding

const EventGalleryScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    // Fetch event data
    const eventRef = doc(db, 'events', eventId);
    const unsubscribeEvent = onSnapshot(eventRef, (docSnap) => {
      if (docSnap.exists()) {
        const eventData = { id: docSnap.id, ...docSnap.data() };
        setEvent(eventData);
      }
    });

    return () => {
      unsubscribeEvent();
    };
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    // Fetch photos
    const photosQuery = query(
      collection(db, 'photos'),
      where('eventId', '==', eventId),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribePhotos = onSnapshot(photosQuery, (snapshot) => {
      const photosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter based on showPhotosRealtime setting
      const now = new Date();
      if (event) {
        const eventStart = event.startTime?.toDate ? event.startTime.toDate() : new Date(event.startTime);
        const eventEnd = event.endTime?.toDate ? event.endTime.toDate() : new Date(event.endTime);

        if (event.showPhotosRealtime || now > eventEnd) {
          setPhotos(photosData);
        } else {
          setPhotos([]);
        }
      } else {
        setPhotos(photosData); // Show photos while loading event data
      }

      setLoading(false);
    });

    return () => {
      unsubscribePhotos();
    };
  }, [eventId, event]);

  const compressImage = async (uri) => {
    try {
      const manipulatedImage = await manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  };

  const uploadPhoto = async (uri, source) => {
    setUploading(true);
    try {
      // Compress image
      const compressedUri = await compressImage(uri);

      // Convert to blob
      const response = await fetch(compressedUri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const photoId = doc(collection(db, 'photos')).id;
      const storageRef = ref(storage, `events/${eventId}/photos/${photoId}.jpg`);
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Create photo document
      await addDoc(collection(db, 'photos'), {
        eventId,
        userId: user.uid,
        userName: user.displayName || user.email,
        downloadUrl,
        uploadedAt: serverTimestamp(),
        source,
      });

      // Update event photo count
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        totalPhotos: increment(1),
      });

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
      // Check camera roll upload limit
      const userPhotosQuery = query(
        collection(db, 'photos'),
        where('eventId', '==', eventId),
        where('userId', '==', user.uid),
        where('source', '==', 'camera_roll')
      );
      const userPhotosSnapshot = await getDocs(userPhotosQuery);
      const userPhotosCount = userPhotosSnapshot.size;
      const maxUploads = event?.maxCameraRollUploads || 10;

      if (userPhotosCount >= maxUploads) {
        Alert.alert(
          'Upload Limit Reached',
          `You've reached your upload limit (${maxUploads} photos). You can still take unlimited in-app camera photos.`
        );
        return;
      }

      const remaining = maxUploads - userPhotosCount;

      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need permission to access your photos.');
        return;
      }

      // Pick images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const selectedCount = result.assets.length;
        if (selectedCount > remaining) {
          Alert.alert(
            'Too Many Photos',
            `You can only upload ${remaining} more photo(s) from your gallery.`
          );
          return;
        }

        // Upload each image
        for (const asset of result.assets) {
          await uploadPhoto(asset.uri, 'camera_roll');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photos: ' + error.message);
    }
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => navigation.navigate('PhotoDetail', { photo: item, photos })}
    >
      <Image source={{ uri: item.downloadUrl }} style={styles.photo} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EA" />
      </View>
    );
  }

  const canViewPhotos = event?.showPhotosRealtime || new Date() > (event?.endTime?.toDate ? event.endTime.toDate() : new Date(event?.endTime));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.photoCount}>{photos.length} photos</Text>
        {!canViewPhotos && (
          <Text style={styles.hintText}>Photos will appear after the event ends</Text>
        )}
      </View>

      {canViewPhotos ? (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No photos yet</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Photos will appear after the event ends</Text>
        </View>
      )}

      {/* FAB Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.fabSecondary]}
          onPress={handleUploadFromGallery}
          disabled={uploading}
        >
          <Text style={styles.fabText}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleTakePhoto}
          disabled={uploading}
        >
          <Text style={styles.fabText}>📸</Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#6200EA" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
    </View>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  photoCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 8,
  },
  photoContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200EA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6200EA',
  },
  fabText: {
    fontSize: 24,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});

export default EventGalleryScreen;

