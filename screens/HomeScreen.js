import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {activeTab === 'myEvents'
          ? "You haven't created any events yet"
          : "You haven't joined any events yet"}
      </Text>
    </View>
  );

  const currentEvents = activeTab === 'myEvents' ? myEvents : joinedEvents;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myEvents' && styles.activeTab]}
          onPress={() => setActiveTab('myEvents')}
        >
          <Text style={[styles.tabText, activeTab === 'myEvents' && styles.activeTabText]}>
            My Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'joinedEvents' && styles.activeTab]}
          onPress={() => setActiveTab('joinedEvents')}
        >
          <Text style={[styles.tabText, activeTab === 'joinedEvents' && styles.activeTabText]}>
            Joined Events
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EA" />
        </View>
      ) : (
        <FlatList
          data={currentEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
          style={styles.fab}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200EA',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6200EA',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200EA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});

export default HomeScreen;

