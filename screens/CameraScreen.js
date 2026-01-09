import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
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
      <View className="flex-1 bg-black">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center p-5">
        <Text className="text-red-500 text-base text-center mb-5">Camera permission denied</Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-lg self-center mt-5"
          onPress={requestPermission}
        >
          <Text className="text-white text-base font-semibold">Request Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-600 px-8 py-3 rounded-lg self-center mt-3"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white text-base font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedPhoto) {
    return (
      <View className="flex-1 bg-black">
        <Image source={{ uri: capturedPhoto }} className="flex-1 w-full" />
        <View className="flex-row justify-around p-5 bg-black">
          <TouchableOpacity
            className="bg-gray-600 px-8 py-3 rounded-lg min-w-[120px] items-center"
            onPress={handleRetake}
            disabled={uploading}
          >
            <Text className="text-white text-base font-semibold">Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-lg min-w-[120px] items-center"
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Upload</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView className="flex-1" facing={facing} ref={cameraRef}>
        <View className="flex-1 bg-transparent justify-end items-center pb-10">
          <TouchableOpacity
            className="absolute top-10 right-5 p-3 bg-black/50 rounded-full"
            onPress={handleFlipCamera}
          >
            <Text className="text-2xl">🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[70px] h-[70px] rounded-full bg-white justify-center items-center border-4 border-primary"
            onPress={handleCapture}
          >
            <View className="w-[50px] h-[50px] rounded-full bg-primary" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

export default CameraScreen;

