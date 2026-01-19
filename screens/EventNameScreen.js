import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const EventNameScreen = ({ navigation, route }) => {
  const { eventData = {}, onNext } = route.params || {};
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
      });
    }
  };

  const handleExamplePress = (example) => {
    setEventName(example);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // Navigate back to home if we can't go back, otherwise go back normally
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }}
        >
          <View style={styles.backButtonCircle}>
            <Text style={styles.backArrow}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Event name</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Event name"
            placeholderTextColor="#666"
            value={eventName}
            onChangeText={setEventName}
            autoCapitalize="words"
          />
          <TouchableOpacity style={styles.infoButton}>
            <View style={styles.infoCircle}>
              <Text style={styles.infoText}>i</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.examplesTitle}>Examples</Text>
        <View style={styles.examplesContainer}>
          {examples.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleChip}
              onPress={() => handleExamplePress(example)}
            >
              <Text style={styles.exampleText}>{example}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.continueButton, !eventName.trim() && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={!eventName.trim()}
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
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoButton: {
    width: 32,
    height: 32,
  },
  infoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
    borderColor: '#333',
    backgroundColor: 'transparent',
  },
  exampleText: {
    color: '#fff',
    fontSize: 14,
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
  continueButtonDisabled: {
    opacity: 0.5,
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

export default EventNameScreen;
