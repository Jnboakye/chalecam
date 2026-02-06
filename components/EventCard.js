import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate, getStatusColor } from '../utils/helpers';

const COVER_HEIGHT = 120;

const EventCard = ({ event, status, onPress }) => {
  const { colors } = useTheme();
  const statusColor = getStatusColor(status);
  const hasCover = !!event.coverImageUrl;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {hasCover ? (
        <Image
          source={{ uri: event.coverImageUrl }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: colors.surface }]}>
          <Text style={[styles.coverPlaceholderText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.name}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {event.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            📅 {formatDate(event.startTime)} - {formatDate(event.endTime)}
          </Text>
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            👥 {event.participants?.length || 0} participants
          </Text>
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            📸 {event.totalPhotos || 0} photos
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: COVER_HEIGHT,
    backgroundColor: '#1a1a1a',
  },
  coverPlaceholder: {
    width: '100%',
    height: COVER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  coverPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  },
});

export default EventCard;
