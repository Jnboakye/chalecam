import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { GoogleIcon, FacebookIcon, EmailIcon } from '../components/Icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Placeholder images for onboarding - you can replace these later
const onboardingImages = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    text: 'Just click a beautiful shot',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    text: 'Share moments with friends',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    text: 'Create lasting memories',
  },
];

const LoginScreen = ({ navigation }) => {
  const { login, signInWithGoogle, signInWithFacebook } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-scroll slideshow
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % onboardingImages.length;
        scrollViewRef.current?.scrollTo({
          x: next * SCREEN_WIDTH,
          animated: true,
        });
        return next;
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentSlide(index);
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  const handleFacebookSignIn = () => {
    signInWithFacebook();
  };

  const handleEmailSignIn = () => {
    // Navigate to email login screen (we'll create this)
    navigation.navigate('EmailLogin');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Onboarding Slideshow */}
      <View style={styles.slideshowContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScroll}
        >
          {onboardingImages.map((item, index) => (
            <View key={item.id} style={styles.slide}>
              <Image
                source={{ uri: item.image }}
                style={styles.slideImage}
                resizeMode="cover"
              />
              <View style={styles.slideOverlay} />
              <Text style={styles.slideText}>{item.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentSlide === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Sign-in Card */}
      <View style={[styles.signInCard, { backgroundColor: colors.isDark ? '#ffffff' : '#ffffff' }]}>
        <Text style={styles.signInTitle}>Signin</Text>

        {/* Google Sign-in */}
        <TouchableOpacity
          style={[styles.signInButton, styles.googleButton]}
          onPress={handleGoogleSignIn}
        >
          <GoogleIcon size={32} />
          <Text style={styles.signInButtonText}>Signin using Google</Text>
        </TouchableOpacity>

        {/* Facebook Sign-in */}
        <TouchableOpacity
          style={[styles.signInButton, styles.facebookButton]}
          onPress={handleFacebookSignIn}
        >
          <FacebookIcon size={32} />
          <Text style={[styles.signInButtonText, { color: '#fff' }]}>
            Signin using Facebook
          </Text>
        </TouchableOpacity>

        {/* Email Sign-in */}
        <TouchableOpacity
          style={[styles.signInButton, styles.emailButton]}
          onPress={handleEmailSignIn}
        >
          <EmailIcon size={24} color="#000" />
          <Text style={styles.signInButtonText}>Signin using Email</Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.signupLinkText}>Signup instead</Text>
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <Text style={styles.termsText}>
          By continuing you are agree to our{' '}
          <Text style={styles.termsLink}>terms of services</Text> and{' '}
          <Text style={styles.termsLink}>privacy policies</Text>.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideshowContainer: {
    height: SCREEN_HEIGHT * 0.5,
    position: 'relative',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: '100%',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  slideText: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  pagination: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#ffffff',
    width: 24,
  },
  signInCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
  },
  facebookButton: {
    backgroundColor: '#1877f2',
    borderColor: '#1877f2',
  },
  emailButton: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginLeft: 12,
  },
  signupLink: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  signupLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: '#666',
  },
});

export default LoginScreen;
