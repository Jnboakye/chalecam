import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { formatDate } from '../utils/helpers';

const { width, height } = Dimensions.get('window');

const PhotoDetailScreen = ({ route, navigation }) => {
  const { photo, photos } = route.params;
  const [currentIndex, setCurrentIndex] = useState(
    photos.findIndex((p) => p.id === photo.id)
  );

  const currentPhoto = photos[currentIndex] || photo;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatUploadDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: currentPhoto.downloadUrl }}
          className="w-full"
          style={{ width, height: height * 0.7 }}
          resizeMode="contain"
        />
        <View className="bg-white p-4 mt-2">
          <Text className="text-lg font-semibold text-gray-800 mb-1">
            📸 {currentPhoto.userName || 'Unknown'}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            {formatUploadDate(currentPhoto.uploadedAt)}
          </Text>
          <Text className="text-xs text-gray-500">
            Source: {currentPhoto.source === 'camera' ? 'Camera' : 'Camera Roll'}
          </Text>
        </View>
      </ScrollView>

      {photos.length > 1 && (
        <View className="flex-row justify-between items-center p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${currentIndex === 0 ? 'bg-gray-300 opacity-50' : 'bg-primary'}`}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Text className="text-white text-sm font-semibold">← Previous</Text>
          </TouchableOpacity>
          <Text className="text-sm text-gray-600 font-medium">
            {currentIndex + 1} / {photos.length}
          </Text>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${currentIndex === photos.length - 1 ? 'bg-gray-300 opacity-50' : 'bg-primary'}`}
            onPress={handleNext}
            disabled={currentIndex === photos.length - 1}
          >
            <Text className="text-white text-sm font-semibold">Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PhotoDetailScreen;

