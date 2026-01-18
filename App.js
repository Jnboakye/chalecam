import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Events Icon Component - Purple circle with camera icon
const EventsIcon = ({ focused }) => (
  <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
    {focused ? (
      <View style={styles.eventsIconActive}>
        <Text style={styles.eventsIconText}>📸</Text>
      </View>
    ) : (
      <View style={styles.eventsIconInactive}>
        <Text style={styles.eventsIconTextInactive}>📸</Text>
      </View>
    )}
  </View>
);

// Join Event Icon Component (QR Code style)
const JoinEventIcon = ({ focused }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, focused && styles.activeIconText]}>📷</Text>
  </View>
);

// Settings Icon Component
const SettingsIcon = ({ focused }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, focused && styles.activeIconText]}>⚙️</Text>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#2a2a2a',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderRadius: 20,
          position: 'absolute',
          marginHorizontal: 20,
          marginBottom: 20,
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
    backgroundColor: '#9b59b6',
    borderRadius: 20,
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

  // TODO: Remove this bypass when auth is ready
  // Temporarily bypass auth to see screens
  const BYPASS_AUTH = true;

  if (loading && !BYPASS_AUTH) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6200EA" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {BYPASS_AUTH ? <MainStack /> : (user ? <MainStack /> : <AuthStack />)}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

