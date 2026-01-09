import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import EventCard from '../components/EventCard';
import { getEventStatus } from '../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('myEvents');
  const [myEvents, setMyEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Subscribe to user's created events
    const myEventsQuery = query(
      collection(db, 'events'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribeMyEvents = onSnapshot(myEventsQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyEvents(events);
      setLoading(false);
      setRefreshing(false);
    });

    // Subscribe to user's joined events
    const joinedEventsQuery = query(
      collection(db, 'events'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribeJoinedEvents = onSnapshot(joinedEventsQuery, (snapshot) => {
      const events = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(event => event.ownerId !== user.uid); // Exclude own events
      setJoinedEvents(events);
    });

    return () => {
      unsubscribeMyEvents();
      unsubscribeJoinedEvents();
    };
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const renderEvent = ({ item }) => {
    const status = getEventStatus(item.startTime, item.endTime);
    return (
      <EventCard
        event={item}
        status={status}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      />
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center pt-24">
      <Text className="text-base text-gray-500 text-center">
        {activeTab === 'myEvents'
          ? "You haven't created any events yet"
          : "You haven't joined any events yet"}
      </Text>
    </View>
  );

  const currentEvents = activeTab === 'myEvents' ? myEvents : joinedEvents;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row border-b border-gray-200 bg-white">
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${activeTab === 'myEvents' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setActiveTab('myEvents')}
        >
          <Text className={`text-base ${activeTab === 'myEvents' ? 'text-primary font-semibold' : 'text-gray-600 font-medium'}`}>
            My Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${activeTab === 'joinedEvents' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setActiveTab('joinedEvents')}
        >
          <Text className={`text-base ${activeTab === 'joinedEvents' ? 'text-primary font-semibold' : 'text-gray-600 font-medium'}`}>
            Joined Events
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6200EA" />
        </View>
      ) : (
        <FlatList
          data={currentEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6200EA']}
            />
          }
        />
      )}

      {activeTab === 'myEvents' && (
        <TouchableOpacity
          className="absolute right-5 bottom-5 w-14 h-14 rounded-full bg-primary justify-center items-center shadow-lg"
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Text className="text-3xl text-white font-light">+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HomeScreen;

