import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatDate, getStatusColor } from '../utils/helpers';

const EventCard = ({ event, status, onPress }) => {
  const statusColor = getStatusColor(status);

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-800 flex-1">{event.name}</Text>
        <View 
          className="px-2 py-1 rounded-xl"
          style={{ backgroundColor: statusColor }}
        >
          <Text className="text-white text-xs font-semibold">{status.toUpperCase()}</Text>
        </View>
      </View>

      <View className="gap-1">
        <Text className="text-sm text-gray-600">
          📅 {formatDate(event.startTime)} - {formatDate(event.endTime)}
        </Text>
        <Text className="text-sm text-gray-600">
          👥 {event.participants?.length || 0} participants
        </Text>
        <Text className="text-sm text-gray-600">
          📸 {event.totalPhotos || 0} photos
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;

