import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const PhotosPerGuestScreen = ({ navigation, route }) => {
  const { eventData = {}, onNext } = route.params || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [photosPerGuest, setPhotosPerGuest] = useState(
    eventData.photosPerGuest || 5
  );
  const [unlimited, setUnlimited] = useState(
    eventData.unlimitedPhotos || false
  );

  const photoOptions = [5, 10, 15, 20, 25];

  const handleContinue = () => {
    if (onNext) {
      onNext({
        photosPerGuest: unlimited ? -1 : photosPerGuest,
        unlimitedPhotos: unlimited,
      });
    } else {
      navigation.navigate('EventSummary', {
        eventData: {
          ...eventData,
          photosPerGuest: unlimited ? -1 : photosPerGuest,
          unlimitedPhotos: unlimited,
        },
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
        <Text style={[styles.title, { color: colors.text }]}>Amount of photos</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
          Select the maximum amount of photos each guest can take- or upload during the event.
        </Text>

        <View style={styles.optionsContainer}>
          {photoOptions.map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.photoOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                !unlimited && photosPerGuest === count && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => {
                setPhotosPerGuest(count);
                setUnlimited(false);
              }}
            >
              <Text
                style={[
                  styles.photoOptionText,
                  { color: colors.text },
                  !unlimited && photosPerGuest === count && { color: '#fff', fontWeight: '600' },
                ]}
              >
                {count} photos
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.unlimitedCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={styles.unlimitedHeader}>
            <View style={styles.unlimitedLeft}>
              <Text style={[styles.unlimitedTitle, { color: colors.text }]}>Unlimited photos</Text>
              <View style={[styles.priceTag, { backgroundColor: colors.success }]}>
                <Text style={styles.priceTagText}>+11,99 €</Text>
              </View>
            </View>
            <View style={[styles.popularTag, { backgroundColor: colors.warning }]}>
              <Text style={[styles.popularTagText, { color: colors.isDark ? '#1a1a1a' : '#000' }]}>POPULAR</Text>
            </View>
          </View>
          <Text style={[styles.unlimitedDescription, { color: colors.textSecondary }]}>
            Allow each guest to take unlimited photos during your event.
          </Text>
          <View style={styles.unlimitedToggle}>
            <Switch
              value={unlimited}
              onValueChange={(value) => {
                setUnlimited(value);
                if (value) {
                  setPhotosPerGuest(-1);
                } else {
                  setPhotosPerGuest(5);
                }
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.continueButton, { backgroundColor: colors.surface }]} onPress={handleContinue}>
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
  },
  contentContainer: {
    padding: 20,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  photoOption: {
    minWidth: 100,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  photoOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  unlimitedCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  unlimitedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unlimitedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unlimitedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  priceTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  popularTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  unlimitedDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  unlimitedToggle: {
    alignSelf: 'flex-end',
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

export default PhotosPerGuestScreen;
