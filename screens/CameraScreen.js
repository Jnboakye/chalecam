import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const CameraScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef(null);

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

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });
      setCapturedPhoto(photo.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo: ' + error.message);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleUpload = async () => {
    if (!capturedPhoto) return;

    setUploading(true);
    try {
      // Compress image
      const compressedUri = await compressImage(capturedPhoto);

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
        source: 'camera',
      });

      // Update event photo count
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        totalPhotos: increment(1),
      });

      setUploading(false);
      Alert.alert('Success', 'Photo uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Failed to upload photo: ' + error.message);
    }
  };

  const handleFlipCamera = () => {
    setFacing(facing === 'back' ? 'front' : 'back');
  };

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
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedPhoto }} style={styles.preview} />
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.retakeButton]}
            onPress={handleRetake}
            disabled={uploading}
          >
            <Text style={styles.controlButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.uploadButton]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.controlButtonText}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={handleFlipCamera}
          >
            <Text style={styles.flipButtonText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  flipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
  },
  flipButtonText: {
    fontSize: 24,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#6200EA',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6200EA',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#000',
  },
  controlButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#666',
  },
  uploadButton: {
    backgroundColor: '#6200EA',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6200EA',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CameraScreen;

