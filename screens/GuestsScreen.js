import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const GuestsScreen = ({ navigation, route }) => {
  const { eventData = {}, onNext } = route.params || {};
  const { colors } = useTheme();
  const [maxGuests, setMaxGuests] = useState(eventData.maxGuests || 7);

  const guestOptions = [7, 25, 50, 100, 150, 200, 250, 500];

  const handleContinue = () => {
    if (onNext) {
      onNext({ maxGuests });
    } else {
      navigation.navigate('PhotosPerGuest', {
        eventData: { ...eventData, maxGuests },
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
        <Text style={styles.title}>Guests</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.instructionText}>
          Select the amount of guests you expect. You can preview the event before any payment. After the payment, the event will be confirmed.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum amount of guests</Text>
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
                    maxGuests === count && styles.guestOptionTextActive,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.contactText}>
            Need more guests? Please contact us{' '}
            <Text style={styles.contactLink}>→</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This plan includes:</Text>
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
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
  guestOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  contactText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  contactLink: {
    color: '#9b59b6',
  },
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
