import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { EventsIcon as EventsIconSVG, JoinEventIcon as JoinEventIconSVG, SettingsIcon as SettingsIconSVG } from './components/Icons';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmailLoginScreen from './screens/EmailLoginScreen';
import HomeScreen from './screens/HomeScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import JoinEventScreen from './screens/JoinEventScreen';
import EventGalleryScreen from './screens/EventGalleryScreen';
import CameraScreen from './screens/CameraScreen';
import PhotoDetailScreen from './screens/PhotoDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import EventNameScreen from './screens/EventNameScreen';
import CoverImageScreen from './screens/CoverImageScreen';
import TimelineScreen from './screens/TimelineScreen';
import GuestsScreen from './screens/GuestsScreen';
import PhotosPerGuestScreen from './screens/PhotosPerGuestScreen';
import EventSummaryScreen from './screens/EventSummaryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
    </Stack.Navigator>
  );
}

// Events Icon Component - Camera icon
const EventsIcon = ({ focused }) => {
  const { colors } = useTheme();
  return (
    <View style={[
      styles.iconContainer, 
      focused && [styles.activeIconContainer, { backgroundColor: colors.primary }]
    ]}>
      <EventsIconSVG 
        size={20} 
        color={focused ? colors.text : colors.textSecondary}
        focused={focused}
      />
    </View>
  );
};

// Join Event Icon Component - QR Code icon
const JoinEventIcon = ({ focused }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.iconContainer}>
      <JoinEventIconSVG 
        size={24} 
        color={focused ? colors.text : colors.textSecondary}
      />
    </View>
  );
};

// Settings Icon Component - Gear icon
const SettingsIcon = ({ focused }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.iconContainer}>
      <SettingsIconSVG 
        size={24} 
        color={focused ? colors.text : colors.textSecondary}
      />
    </View>
  );
};

function MainTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: 70 + insets.bottom, // Add safe area padding
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 20, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          overflow: 'hidden',
          opacity: 1, // Ensure fully opaque
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Events"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ focused }) => <EventsIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="JoinEvent"
        component={JoinEventScreen}
        options={{
          tabBarLabel: 'Join Event',
          tabBarIcon: ({ focused }) => <JoinEventIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <SettingsIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsIconActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsIconInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsIconText: {
    fontSize: 18,
    color: '#fff',
  },
  eventsIconTextInactive: {
    fontSize: 18,
    color: '#999',
  },
  iconText: {
    fontSize: 20,
    color: '#999',
  },
  activeIconText: {
    color: '#fff',
  },
});

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200EA',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventName"
        component={EventNameScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CoverImage"
        component={CoverImageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Guests"
        component={GuestsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PhotosPerGuest"
        component={PhotosPerGuestScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventSummary"
        component={EventSummaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen
        name="EventGallery"
        component={EventGalleryScreen}
        options={{ title: 'Event Photos' }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'Take Photo' }}
      />
      <Stack.Screen
        name="PhotoDetail"
        component={PhotoDetailScreen}
        options={{ title: 'Photo' }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#9b59b6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

