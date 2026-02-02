import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHONE_PREVIEW_WIDTH = Math.min(SCREEN_WIDTH - 48, 220);
const PHONE_PREVIEW_ASPECT = 9 / 16;

const CoverImageScreen = ({ navigation, route }) => {
  const { eventData = {}, onNext } = route.params || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [coverImage, setCoverImage] = useState(eventData.coverImage || null);

  const eventName = eventData.name || 'Your event';

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
        {!coverImage ? (
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
            <Text style={[styles.editNote, { color: colors.textSecondary }]}>Everything can be edited later</Text>
          </View>
        ) : (
          <View style={styles.previewSection}>
            <View style={[styles.phoneFrame, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.phoneScreen, { width: PHONE_PREVIEW_WIDTH, height: PHONE_PREVIEW_WIDTH / PHONE_PREVIEW_ASPECT }]}>
                <Image source={{ uri: coverImage }} style={styles.coverImageInPhone} />
                <View style={styles.phoneOverlay}>
                  <Text style={styles.phoneOverlayTitle} numberOfLines={2}>
                    {eventName}
                  </Text>
                  <View style={[styles.phoneCtaButton, { backgroundColor: colors.primary }]}>
                    <Text style={styles.phoneCtaText}>Open camera</Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={[styles.guestPrompt, { color: colors.textSecondary }]}>
              This is the cover that guests will see when they scan the QR code. You can change this cover image any time.
            </Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.uploadNewButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={pickImage}
              >
                <Text style={[styles.uploadNewIcon, { color: colors.primary }]}>↑</Text>
                <Text style={[styles.uploadNewText, { color: colors.text }]}>Upload new</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.continuePreviewButton, { backgroundColor: colors.primary }]}
                onPress={handleContinue}
              >
                <Text style={styles.continuePreviewText}>Continue</Text>
                <Text style={styles.continuePreviewArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {!coverImage && (
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.surface }]}
          onPress={handleContinue}
        >
          <Text style={[styles.continueButtonText, { color: colors.text }]}>Continue</Text>
          <Text style={[styles.continueArrow, { color: colors.text }]}>→</Text>
        </TouchableOpacity>
      )}
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
    padding: 20,
    justifyContent: 'center',
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
  previewSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  phoneFrame: {
    borderRadius: 20,
    padding: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneScreen: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImageInPhone: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  phoneOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  phoneOverlayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  phoneCtaButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  phoneCtaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  guestPrompt: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
    paddingTop: 16,
  },
  uploadNewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  uploadNewIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  uploadNewText: {
    fontSize: 14,
    fontWeight: '600',
  },
  continuePreviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  continuePreviewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  continuePreviewArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
