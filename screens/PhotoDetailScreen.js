import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: currentPhoto.downloadUrl }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.uploaderName}>
            📸 {currentPhoto.userName || 'Unknown'}
          </Text>
          <Text style={styles.uploadDate}>
            {formatUploadDate(currentPhoto.uploadedAt)}
          </Text>
          <Text style={styles.source}>
            Source: {currentPhoto.source === 'camera' ? 'Camera' : 'Camera Roll'}
          </Text>
        </View>
      </ScrollView>

      {photos.length > 1 && (
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>
          <Text style={styles.counter}>
            {currentIndex + 1} / {photos.length}
          </Text>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === photos.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={currentIndex === photos.length - 1}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  uploaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  uploadDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  source: {
    fontSize: 12,
    color: '#999',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6200EA',
    borderRadius: 8,
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  counter: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default PhotoDetailScreen;

