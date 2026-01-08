import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDate, getStatusColor } from '../utils/helpers';

const EventCard = ({ event, status, onPress }) => {
  const statusColor = getStatusColor(status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.eventName}>{event.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          📅 {formatDate(event.startTime)} - {formatDate(event.endTime)}
        </Text>
        <Text style={styles.detailText}>
          👥 {event.participants?.length || 0} participants
        </Text>
        <Text style={styles.detailText}>
          📸 {event.totalPhotos || 0} photos
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  details: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
});

export default EventCard;

