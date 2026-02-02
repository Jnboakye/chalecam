import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';

const START_DATE_INFO_TITLE = 'Start date & time';
const START_DATE_INFO_MESSAGE =
  'This is when your event begins. Guests will be able to join and take photos from this moment. Choose the date and time that works best for your event.';

const END_DATE_INFO_TITLE = 'End date & time';
const END_DATE_INFO_MESSAGE =
  'This is when your event ends. After this time, guests can no longer upload new photos to this event. Make sure the end time gives everyone enough time to share their photos.';

const TimelineScreen = ({ navigation, route }) => {
  const { eventData = {}, onNext } = route.params || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
        <Text style={[styles.title, { color: colors.text }]}>Timeline</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            Let's set up the timeline of your event.
          </Text>
        </View>

        {/* Start Date Section - Always Visible */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Start date</Text>
          <View style={styles.fieldRow}>
            <TouchableOpacity
              style={[
                styles.dateInput,
                { backgroundColor: colors.card, borderColor: colors.border },
                startDateSelected && { borderColor: colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={[styles.dateText, { color: colors.text }]}>{formatDateTime(startDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => Alert.alert(START_DATE_INFO_TITLE, START_DATE_INFO_MESSAGE)}
            >
              <View style={[styles.infoCircle, { backgroundColor: colors.surface }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>i</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* End Date Section - Animated In */}
        {startDateSelected && (
          <Animated.View 
            style={[
              styles.fieldContainer,
              endDateAnimatedStyle,
            ]}
          >
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>End date</Text>
          <View style={styles.fieldRow}>
            <TouchableOpacity
              style={[
                styles.dateInput,
                { backgroundColor: colors.card, borderColor: colors.border },
                endDateSelected && { borderColor: colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={[styles.dateText, { color: colors.text }]}>{formatDateTime(endDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => Alert.alert(END_DATE_INFO_TITLE, END_DATE_INFO_MESSAGE)}
            >
              <View style={[styles.infoCircle, { backgroundColor: colors.surface }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>i</Text>
              </View>
            </TouchableOpacity>
          </View>
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
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Reveal photos</Text>
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
                    revealPhotos === option.value && { color: '#fff', fontWeight: '600' },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.revealDescription, { color: colors.textSecondary }]}>
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

      {/* Date/Time picker modal (iOS: spinner in modal; Android: native dialog, no modal) */}
      {Platform.OS === 'ios' && (showStartPicker || showEndPicker) && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowStartPicker(false);
            setShowEndPicker(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => {
                setShowStartPicker(false);
                setShowEndPicker(false);
              }}
            />
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {showStartPicker ? 'Start date & time' : 'End date & time'}
              </Text>
              <View style={[styles.pickerContainer, Platform.OS === 'ios' && styles.pickerContainerIOS]}>
                <DateTimePicker
                  value={showStartPicker ? startDate : endDate}
                  mode="datetime"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                  themeVariant={colors.isDark ? 'dark' : 'light'}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      if (showStartPicker) {
                        handleStartDateChange(selectedDate);
                      } else {
                        handleEndDateChange(selectedDate);
                      }
                    }
                  }}
                />
              </View>
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setShowStartPicker(false);
                  setShowEndPicker(false);
                }}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Android: native date/time dialog only (invisible trigger, no inline picker below box) */}
      {Platform.OS === 'android' && (showStartPicker || showEndPicker) && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <DateTimePicker
            value={showStartPicker ? startDate : endDate}
            mode="datetime"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);
              setShowEndPicker(false);
              if (selectedDate) {
                if (showStartPicker) {
                  handleStartDateChange(selectedDate);
                } else {
                  handleEndDateChange(selectedDate);
                }
              }
            }}
          />
        </View>
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
  },
  contentContainer: {
    padding: 20,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  fieldContainer: {
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 14,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
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
  revealDescription: {
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pickerContainer: {
    width: '100%',
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainerIOS: {
    height: 320,
    minHeight: 320,
  },
  modalConfirmButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimelineScreen;
