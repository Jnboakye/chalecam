import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  ScrollView
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import EventCard from '../components/EventCard';
import { getEventStatus } from '../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recent');
  const [myEvents, setMyEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

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

    // Subscribe to user's joined events (for recent)
    const joinedEventsQuery = query(
      collection(db, 'events'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribeJoinedEvents = onSnapshot(joinedEventsQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by most recent first
      const sorted = events.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
      setRecentEvents(sorted);
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

  const renderEmpty = () => {
    if (activeTab === 'recent') {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent events</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You haven't created any events yet</Text>
      </View>
    );
  };

  const currentEvents = activeTab === 'recent' ? recentEvents : myEvents;
  const hasEvents = currentEvents.length > 0;

  return (
    <View style={styles.container}>
      {/* Top Header with Tabs */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
            onPress={() => setActiveTab('recent')}
          >
            <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
              Recent
            </Text>
            {activeTab === 'recent' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myEvents' && styles.activeTab]}
            onPress={() => setActiveTab('myEvents')}
          >
            <Text style={[styles.tabText, activeTab === 'myEvents' && styles.activeTabText]}>
              My events
            </Text>
            {activeTab === 'myEvents' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.newEventButton}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Text style={styles.newEventButtonText}>New event +</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9b59b6" />
          </View>
        ) : hasEvents ? (
          <FlatList
            data={currentEvents}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#9b59b6"
              />
            }
          />
        ) : (
          <View style={styles.createEventCard}>
            <View style={styles.createEventIconContainer}>
              <View style={styles.createEventIconCircle}>
                <Text style={styles.createEventIcon}>+</Text>
              </View>
            </View>
            <Text style={styles.createEventTitle}>Create event</Text>
            <Text style={styles.createEventDescription}>
              Let's start by setting up your first event
            </Text>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <Text style={styles.setupButtonText}>Setup my event</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#1a1a1a',
  },
  tabContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    marginRight: 24,
    paddingBottom: 8,
  },
  activeTab: {
    // Active tab styling
  },
  tabText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#9b59b6',
  },
  newEventButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newEventButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  createEventCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  createEventIconContainer: {
    marginBottom: 24,
  },
  createEventIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createEventIcon: {
    fontSize: 40,
    color: '#000',
    fontWeight: '300',
  },
  createEventTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  createEventDescription: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  setupButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
  },
  setupButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;

