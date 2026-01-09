import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import { formatDate, getEventStatus } from '../utils/helpers';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    if (!eventId) return;

    const eventRef = doc(db, 'events', eventId);
    const unsubscribe = onSnapshot(eventRef, async (docSnap) => {
      if (docSnap.exists()) {
        const eventData = { id: docSnap.id, ...docSnap.data() };
        setEvent(eventData);

        // Fetch pending user details
        if (eventData.pendingApprovals && eventData.pendingApprovals.length > 0) {
          const userPromises = eventData.pendingApprovals.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return userDoc.exists() ? { uid: userId, ...userDoc.data() } : null;
          });
          const users = (await Promise.all(userPromises)).filter(Boolean);
          setPendingUsers(users);
        } else {
          setPendingUsers([]);
        }

        setLoading(false);
      } else {
        Alert.alert('Error', 'Event not found');
        navigation.goBack();
      }
    });

    return unsubscribe;
  }, [eventId]);

  const isOwner = event?.ownerId === user?.uid;
  const isParticipant = event?.participants?.includes(user?.uid);
  const isPending = event?.pendingApprovals?.includes(user?.uid);
  const status = event ? getEventStatus(event.startTime, event.endTime) : null;

  const handleApprove = async (userId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        participants: arrayUnion(userId),
        pendingApprovals: arrayRemove(userId),
      });

      // Update user's eventsJoined array
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          eventsJoined: arrayUnion(eventId),
        });
      }

      Alert.alert('Success', 'User approved');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve user: ' + error.message);
    }
  };

  const handleReject = async (userId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        pendingApprovals: arrayRemove(userId),
      });
      Alert.alert('Success', 'User rejected');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject user: ' + error.message);
    }
  };

  const handleShareCode = () => {
    Alert.alert('Event Code', `Share this code: ${event.eventCode}`, [{ text: 'OK' }]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6200EA" />
      </View>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Event Info Card */}
      <View className="bg-white m-4 p-4 rounded-xl shadow-sm">
        <Text className="text-2xl font-bold text-gray-800 mb-2">{event.name}</Text>
        <Text className="text-sm text-gray-600 mb-4">Created by {event.ownerName}</Text>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600 font-medium">Start:</Text>
          <Text className="text-sm text-gray-800">{formatDate(event.startTime)}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600 font-medium">End:</Text>
          <Text className="text-sm text-gray-800">{formatDate(event.endTime)}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600 font-medium">Status:</Text>
          <Text className={`text-sm ${status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
            {status?.toUpperCase()}
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600 font-medium">Participants:</Text>
          <Text className="text-sm text-gray-800">{event.participants?.length || 0}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600 font-medium">Photos:</Text>
          <Text className="text-sm text-gray-800">{event.totalPhotos || 0}</Text>
        </View>
      </View>

      {/* QR Code (Owner only) */}
      {isOwner && (
        <View className="bg-white m-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">QR Code</Text>
          <View className="items-center my-4">
            <QRCode value={eventId} size={200} />
          </View>
          <TouchableOpacity className="bg-primary rounded-lg p-3 items-center mt-2" onPress={handleShareCode}>
            <Text className="text-white text-base font-semibold">Share Event Code</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pending Approvals (Owner only) */}
      {isOwner && event.requireApproval && pendingUsers.length > 0 && (
        <View className="bg-white m-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Pending Approvals</Text>
          {pendingUsers.map((pendingUser) => (
            <View key={pendingUser.uid} className="flex-row justify-between items-center py-3 border-b border-gray-200">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">
                  {pendingUser.displayName || pendingUser.email}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">{pendingUser.email}</Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="bg-green-600 px-4 py-2 rounded-md"
                  onPress={() => handleApprove(pendingUser.uid)}
                >
                  <Text className="text-white text-sm font-semibold">Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-500 px-4 py-2 rounded-md"
                  onPress={() => handleReject(pendingUser.uid)}
                >
                  <Text className="text-white text-sm font-semibold">Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Participant Status */}
      {!isOwner && (
        <View className="bg-white m-4 p-4 rounded-xl shadow-sm">
          {isPending ? (
            <View className="bg-yellow-100 p-3 rounded-lg border border-yellow-400">
              <Text className="text-sm text-yellow-800 text-center">
                ⏳ Waiting for approval from event owner
              </Text>
            </View>
          ) : isParticipant ? (
            <View className="bg-yellow-100 p-3 rounded-lg border border-yellow-400">
              <Text className="text-sm text-green-600 text-center">
                ✅ You are a participant
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* View Photos Button */}
      {(isOwner || (isParticipant && !isPending)) && (
        <View className="bg-white m-4 p-4 rounded-xl shadow-sm">
          <TouchableOpacity
            className="bg-primary rounded-lg p-4 items-center"
            onPress={() => navigation.navigate('EventGallery', { eventId: event.id })}
          >
            <Text className="text-white text-base font-semibold">View Photos</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default EventDetailScreen;

