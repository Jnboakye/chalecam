import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';

const CoverImageScreen = ({ navigation, route }) => {
  const { eventData = {}, onNext } = route.params || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
        <Text style={[styles.title, { color: colors.text }]}>Cover image</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={styles.iconContainer}>
            <View style={styles.uploadIcon}>
              <Text style={[styles.uploadIconArrow, { color: colors.primary }]}>↑</Text>
              <View style={[styles.uploadIconLine, { backgroundColor: colors.primary }]} />
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Select cover image</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Let's set up the screen your guests will see before they join.
          </Text>
          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: colors.primary }]}
            onPress={pickImage}
          >
            <Text style={styles.selectButtonText}>Select cover image</Text>
          </TouchableOpacity>
          {coverImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: coverImage }} style={styles.previewImage} />
            </View>
          )}
          <Text style={[styles.editNote, { color: colors.textSecondary }]}>Everything can be edited later</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, { backgroundColor: colors.surface }]}
        onPress={handleContinue}
      >
        <Text style={[styles.continueButtonText, { color: colors.text }]}>Continue</Text>
        <Text style={[styles.continueArrow, { color: colors.text }]}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
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
    fontWeight: '300',
  },
  uploadIconLine: {
    position: 'absolute',
    bottom: 10,
    width: 40,
    height: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  selectButton: {
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
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
    marginTop: 16,
    textAlign: 'center',
  },
  continueButton: {
    borderRadius: 12,
    padding: 16,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  continueArrow: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CoverImageScreen;
