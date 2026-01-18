import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const CoverImageScreen = ({ navigation, route }) => {
  const { eventData = {}, onNext } = route.params || {};
  const [coverImage, setCoverImage] = useState(eventData.coverImage || null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (onNext) {
      onNext({ coverImage });
    } else {
      navigation.navigate('Timeline', {
        eventData: { ...eventData, coverImage },
      });
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
        <Text style={styles.title}>Cover image</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={styles.uploadIcon}>
              <Text style={styles.uploadIconArrow}>↑</Text>
              <View style={styles.uploadIconLine} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Select cover image</Text>
          <Text style={styles.cardDescription}>
            Let's set up the screen your guests will see before they join.
          </Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={pickImage}
          >
            <Text style={styles.selectButtonText}>Select cover image</Text>
          </TouchableOpacity>
          {coverImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: coverImage }} style={styles.previewImage} />
            </View>
          )}
          <Text style={styles.editNote}>Everything can be edited later</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
        <Text style={styles.continueArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

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
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9b59b6',
  },
  iconContainer: {
    marginBottom: 24,
  },
  uploadIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconArrow: {
    fontSize: 32,
    color: '#9b59b6',
    fontWeight: '300',
  },
  uploadIconLine: {
    position: 'absolute',
    bottom: 10,
    width: 40,
    height: 2,
    backgroundColor: '#9b59b6',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  selectButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 24,
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editNote: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  continueArrow: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CoverImageScreen;
