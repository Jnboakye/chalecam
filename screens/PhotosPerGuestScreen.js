import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';

const PhotosPerGuestScreen = ({ navigation, route }) => {
  const { eventData = {}, onNext } = route.params || {};
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
        <Text style={styles.title}>Amount of photos</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.instructionText}>
          Select the maximum amount of photos each guest can take- or upload during the event.
        </Text>

        <View style={styles.optionsContainer}>
          {photoOptions.map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.photoOption,
                !unlimited && photosPerGuest === count && styles.photoOptionActive,
              ]}
              onPress={() => {
                setPhotosPerGuest(count);
                setUnlimited(false);
              }}
            >
              <Text
                style={[
                  styles.photoOptionText,
                  !unlimited && photosPerGuest === count && styles.photoOptionTextActive,
                ]}
              >
                {count} photos
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.unlimitedCard}>
          <View style={styles.unlimitedHeader}>
            <View style={styles.unlimitedLeft}>
              <Text style={styles.unlimitedTitle}>Unlimited photos</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceTagText}>+11,99 €</Text>
              </View>
            </View>
            <View style={styles.popularTag}>
              <Text style={styles.popularTagText}>POPULAR</Text>
            </View>
          </View>
          <Text style={styles.unlimitedDescription}>
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
              trackColor={{ false: '#333', true: '#9b59b6' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
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
  },
  contentContainer: {
    padding: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
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
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  photoOptionActive: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  photoOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  photoOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  unlimitedCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#9b59b6',
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
    color: '#fff',
    marginRight: 12,
  },
  priceTag: {
    backgroundColor: '#4caf50',
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
    backgroundColor: '#ffc107',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularTagText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unlimitedDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    lineHeight: 20,
  },
  unlimitedToggle: {
    alignSelf: 'flex-end',
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

export default PhotosPerGuestScreen;
