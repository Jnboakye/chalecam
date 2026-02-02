import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const EventNameScreen = ({ navigation, route }) => {
  const { eventData = {}, eventId, onNext } = route.params || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [eventName, setEventName] = useState(eventData.name || '');

  const examples = [
    "Alicia & Name's wedding",
    "Alicia's Bachelor Party",
    "Alicia's Birthday Party",
    "Our trip to",
  ];

  const handleContinue = () => {
    if (!eventName.trim()) {
      return;
    }
    if (onNext) {
      onNext({ name: eventName.trim() });
    } else {
      navigation.navigate('CoverImage', {
        eventData: { ...eventData, name: eventName.trim() },
        ...(eventId != null && { eventId }),
      });
    }
  };

  const handleExamplePress = (example) => {
    setEventName(example);
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
        <Text style={[styles.title, { color: colors.text }]}>Event name</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Event name"
            placeholderTextColor={colors.textSecondary}
            value={eventName}
            onChangeText={setEventName}
            autoCapitalize="words"
          />
          <TouchableOpacity style={styles.infoButton}>
            <View style={[styles.infoCircle, { backgroundColor: colors.surface }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>i</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.examplesTitle, { color: colors.text }]}>Examples</Text>
        <View style={styles.examplesContainer}>
          {examples.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.exampleChip, { borderColor: colors.border }]}
              onPress={() => handleExamplePress(example)}
            >
              <Text style={[styles.exampleText, { color: colors.text }]}>{example}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: colors.surface },
          !eventName.trim() && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!eventName.trim()}
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
  },
  contentContainer: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginRight: 12,
    borderWidth: 1,
  },
  infoButton: {
    width: 32,
    height: 32,
  },
  infoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  examplesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exampleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  exampleText: {
    fontSize: 14,
  },
  continueButton: {
    borderRadius: 12,
    padding: 16,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
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

export default EventNameScreen;
