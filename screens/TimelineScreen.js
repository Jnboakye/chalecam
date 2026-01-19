import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';

const TimelineScreen = ({ navigation, route }) => {
  const { eventData = {}, onNext } = route.params || {};
  const { colors } = useTheme();
  const [startDate, setStartDate] = useState(
    eventData.startDate || new Date()
  );
  const [endDate, setEndDate] = useState(
    eventData.endDate || new Date(Date.now() + 3600000)
  );
  const [revealPhotos, setRevealPhotos] = useState(
    eventData.revealPhotos || null
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // Track which sections should be visible
  const [startDateSelected, setStartDateSelected] = useState(false);
  const [endDateSelected, setEndDateSelected] = useState(false);
  const [revealSelected, setRevealSelected] = useState(false);

  // Animation values using React Native Animated API
  const endDateOpacity = useRef(new Animated.Value(0)).current;
  const endDateTranslateY = useRef(new Animated.Value(30)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealTranslateY = useRef(new Animated.Value(30)).current;
  const continueOpacity = useRef(new Animated.Value(0)).current;
  const continueTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // If we have existing data, show all sections
    if (eventData.startDate) {
      setStartDateSelected(true);
      Animated.parallel([
        Animated.timing(endDateOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(endDateTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
    if (eventData.endDate) {
      setEndDateSelected(true);
      Animated.parallel([
        Animated.timing(revealOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(revealTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
    if (eventData.revealPhotos) {
      setRevealSelected(true);
      Animated.parallel([
        Animated.timing(continueOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(continueTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartDateChange = (selectedDate) => {
    if (selectedDate) {
      setStartDate(selectedDate);
      setStartDateSelected(true);
      // Animate end date in
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(endDateOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(endDateTranslateY, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    }
  };

  const handleEndDateChange = (selectedDate) => {
    if (selectedDate) {
      setEndDate(selectedDate);
      setEndDateSelected(true);
      // Animate reveal photos in
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(revealOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(revealTranslateY, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    }
  };

  const handleRevealChange = (value) => {
    setRevealPhotos(value);
    setRevealSelected(true);
    // Animate continue button in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(continueOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(continueTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);
  };

  const handleContinue = () => {
    if (onNext) {
      onNext({ startDate, endDate, revealPhotos: revealPhotos || 'during' });
    } else {
      navigation.navigate('Guests', {
        eventData: { ...eventData, startDate, endDate, revealPhotos: revealPhotos || 'during' },
      });
    }
  };

  const revealOptions = [
    { value: 'after', label: 'After event' },
    { value: 'during', label: 'During event' },
    { value: 'hidden', label: 'Hidden' },
  ];

  // Animated styles using React Native Animated API
  const endDateAnimatedStyle = {
    opacity: endDateOpacity,
    transform: [{ translateY: endDateTranslateY }],
  };

  const revealAnimatedStyle = {
    opacity: revealOpacity,
    transform: [{ translateY: revealTranslateY }],
  };

  const continueAnimatedStyle = {
    opacity: continueOpacity,
    transform: [{ translateY: continueTranslateY }],
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
        <Text style={styles.title}>Timeline</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.instructionText}>
            Let's set up the timeline of your event.
          </Text>
        </View>

        {/* Start Date Section - Always Visible */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Start date</Text>
          <View style={styles.fieldRow}>
            <TouchableOpacity
              style={[
                styles.dateInput,
                { backgroundColor: colors.card, borderColor: colors.border },
                startDateSelected && { borderColor: colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateText}>{formatDateTime(startDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton}>
              <View style={styles.infoCircle}>
                <Text style={styles.infoText}>i</Text>
              </View>
            </TouchableOpacity>
          </View>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              is24Hour={false}
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(Platform.OS === 'ios');
                handleStartDateChange(selectedDate);
              }}
            />
          )}
        </View>

        {/* End Date Section - Animated In */}
        {startDateSelected && (
          <Animated.View 
            style={[
              styles.fieldContainer,
              endDateAnimatedStyle,
            ]}
          >
          <Text style={styles.fieldLabel}>End date</Text>
          <View style={styles.fieldRow}>
            <TouchableOpacity
              style={[
                styles.dateInput,
                { backgroundColor: colors.card, borderColor: colors.border },
                endDateSelected && { borderColor: colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateText}>{formatDateTime(endDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton}>
              <View style={styles.infoCircle}>
                <Text style={styles.infoText}>i</Text>
              </View>
            </TouchableOpacity>
          </View>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              is24Hour={false}
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndPicker(Platform.OS === 'ios');
                handleEndDateChange(selectedDate);
              }}
            />
          )}
          </Animated.View>
        )}

        {/* Reveal Photos Section - Animated In */}
        {endDateSelected && (
          <Animated.View 
            style={[
              styles.fieldContainer,
              revealAnimatedStyle,
            ]}
          >
          <Text style={styles.fieldLabel}>Reveal photos</Text>
          <View style={styles.revealOptionsContainer}>
            {revealOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.revealOption,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  revealPhotos === option.value && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => handleRevealChange(option.value)}
              >
                <Text
                  style={[
                    styles.revealOptionText,
                    { color: colors.text },
                    revealPhotos === option.value && styles.revealOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.revealDescription}>
            Guests can view the album during- and after the event.
          </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Continue Button - Animated In */}
      {revealSelected && (
        <Animated.View style={continueAnimatedStyle}>
      <TouchableOpacity 
        style={[styles.continueButton, { backgroundColor: colors.surface }]}
        onPress={handleContinue}
      >
        <Text style={[styles.continueButtonText, { color: colors.text }]}>Continue</Text>
        <Text style={[styles.continueArrow, { color: colors.text }]}>→</Text>
      </TouchableOpacity>
        </Animated.View>
      )}
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
  fieldContainer: {
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
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
  revealOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  revealOption: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  revealOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  revealOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  revealDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  continueButton: {
    borderRadius: 12,
    padding: 16,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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

export default TimelineScreen;
