import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const GuestsScreen = ({ navigation, route }) => {
  const { eventData = {}, eventId, onNext } = route.params || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [maxGuests, setMaxGuests] = useState(eventData.maxGuests || 7);

  const guestOptions = [7, 25, 50, 100, 150, 200, 250, 500];

  const handleContinue = () => {
    if (onNext) {
      onNext({ maxGuests });
    } else {
      navigation.navigate('PhotosPerGuest', {
        eventData: { ...eventData, maxGuests },
        ...(eventId != null && { eventId }),
      });
    }
  };

  const planFeatures = [
    'Instant camera without app download',
    'Scannable QR or link',
    'Full album download',
    'Free and unlimited downloads',
    'Shared album',
    'Uploads from camera roll',
    'and more...',
  ];

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
        <Text style={[styles.title, { color: colors.text }]}>Guests</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
          Select the amount of guests you expect. You can preview the event before any payment. After the payment, the event will be confirmed.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Maximum amount of guests</Text>
          <View style={styles.guestOptionsContainer}>
            {guestOptions.map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.guestOption,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  maxGuests === count && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setMaxGuests(count)}
              >
                <Text
                  style={[
                    styles.guestOptionText,
                    { color: colors.text },
                    maxGuests === count && { color: '#fff', fontWeight: '600' },
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            Need more guests? Please contact us{' '}
            <Text style={[styles.contactLink, { color: colors.primary }]}>→</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>This plan includes:</Text>
          <View style={styles.featuresContainer}>
            {planFeatures.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.checkmarkCircle, { backgroundColor: colors.primary }]}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.priceText, { color: colors.text }]}>Price: free</Text>
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
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  guestOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  guestOption: {
    minWidth: 60,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  guestOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactText: {
    fontSize: 14,
    marginTop: 8,
  },
  contactLink: {},
  featuresContainer: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  priceContainer: {
    marginTop: 16,
  },
  priceText: {
    fontSize: 18,
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

export default GuestsScreen;
